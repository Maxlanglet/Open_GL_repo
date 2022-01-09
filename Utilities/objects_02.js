var load_obj = async function(name = 'bunny_small.obj',is_multiple=0) {
    async function load_mesh(string) {
      var lines = string.split("\n");
      var positions = [];
      var normals = [];
      var textures = [];
      var vertices = [];
     var min=[1000,1000,1000];
     var max = [-1000,-1000,-1000];

      for ( var i = 0 ; i < lines.length ; i++ ) {
        var parts = lines[i].trimRight().split(' ');
        if ( parts.length > 0 ) {
          switch(parts[0]) {
            case 'v':  positions.push(
              glMatrix.vec3.fromValues(
                parseFloat(parts[1]),
                parseFloat(parts[2]),
                parseFloat(parts[3])
              ));
            for(var j = 0;j<3;j++){
                if(min[j] > parseFloat(parts[j+1]))
                    min[j] = parseFloat(parts[j+1]);
                if(max[j] < parseFloat(parts[j+1]))
                    max[j] = parseFloat(parts[j+1]);
            }
              break;
            case 'vn':
              normals.push(
                glMatrix.vec3.fromValues(
                  parseFloat(parts[1]),
                  parseFloat(parts[2]),
                  parseFloat(parts[3])
              ));
              break;
            case 'vt':
              textures.push(
                glMatrix.vec2.fromValues(
                  parseFloat(parts[1]),
                  parseFloat(parts[2])
              ));
              break;
            case 'f': {
              // f = vertex/texture/normal vertex/texture/normal vertex/texture/normal
              var f1 = parts[1].split('/');
              var f2 = parts[2].split('/');
              var f3 = parts[3].split('/');
              // Push vertex 1 of the face
              Array.prototype.push.apply(
                vertices, positions[parseInt(f1[0]) - 1]
              );
              Array.prototype.push.apply(
                vertices, textures[parseInt(f1[1]) - 1]
              );
              Array.prototype.push.apply(
                vertices, normals[parseInt(f1[2]) - 1]
              );
              // Push vertex 2 of the face
              Array.prototype.push.apply(
                vertices, positions[parseInt(f2[0]) - 1]
              );
              Array.prototype.push.apply(
                vertices, textures[parseInt(f2[1]) - 1]
              );
              Array.prototype.push.apply(
                vertices, normals[parseInt(f2[2]) - 1]
              );
              // Push vertex 3 of the face
              Array.prototype.push.apply(
                vertices, positions[parseInt(f3[0]) - 1]
              );
              Array.prototype.push.apply(
                vertices, textures[parseInt(f3[1]) - 1]
              );
              Array.prototype.push.apply(
                vertices, normals[parseInt(f3[2]) - 1]
              );
              break;
            }
          }
        }
      }
      var vertexCount = vertices.length / 8;// /8 because 3+2+3 dimensions for position/texture/normal
      // console.log("Vertices : ", vertices.length);
      // console.log("Loaded mesh with " + vertexCount + " vertices");
      return {
        buffer: new Float32Array(vertices),
        num_triangles: vertexCount,
          min:min,
          max:max
      };
    }

    if (is_multiple === 0){
        const response = await fetch(name);
        var text = await response.text();
        var ret = await load_mesh(text);}
    else {
        var ret = [];
        for (var i = 1; i <= is_multiple; i++) {
            var tmp = name.split(".obj")[0] + i.toString() + ".obj";
            const response = await fetch(tmp);
            var text = await response.text();
            ret.push(await load_mesh(text))
        }
    }
    return ret;
};

var make_objects = async function(gl, objs) {
    var mesh = [];
    for(var i = 0;i<objs.length;i++){
        var obj = await objs[i];
        mesh.push(await make_object(gl,obj))
    }
    return mesh
};

var make_object = async function(gl, obj) {
    // We need the object to be ready to proceed:
    obj = await obj;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, obj.buffer, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var Model = glMatrix.mat4.create();
    //Model = glMatrix.mat4.translate(Model, Model, glMatrix.vec3.fromValues(0.5, -0.5, -1.0));
    let center = [0,0,0];
    for(var j = 0;j<3;j++)
        center[j] = (obj.min[j] + obj.max[j])/2;

    async function buildTriangleMeshShape(scaleFactor,shapeName){
        var objShape;
        if(shapeName !== "") {
            objShape = await load_obj(shapeName);
        }
        else
            objShape = obj;

        let triangleMesh = new Ammo.btTriangleMesh(true,true);

        for(var i = 0;i<objShape.buffer.length;i+=3*8){
            var v1 = new Ammo.btVector3((objShape.buffer[i]-(objShape.min[0]+objShape.max[0])/2),(objShape.buffer[i+1]-(objShape.min[1]+objShape.max[1])/2),(objShape.buffer[i+2]-(objShape.min[2]+objShape.max[2])/2));
            var v2 = new Ammo.btVector3((objShape.buffer[i+8]-(objShape.min[0]+objShape.max[0])/2),(objShape.buffer[i+1+8]-(objShape.min[1]+objShape.max[1])/2),(objShape.buffer[i+2+8]-(objShape.min[2]+objShape.max[2])/2));
            var v3 = new Ammo.btVector3((objShape.buffer[i+16]-(objShape.min[0]+objShape.max[0])/2),(objShape.buffer[i+1+16]-(objShape.min[1]+objShape.max[1])/2),(objShape.buffer[i+2+16]-(objShape.min[2]+objShape.max[2])/2));

            triangleMesh.addTriangle(v1,v2,v3,true);
        }

        //return new Ammo.btConvexTriangleMeshShape(triangleMesh,true,true);
        return new Ammo.btBvhTriangleMeshShape(triangleMesh,true,true);
    }

    function activate(shader) {
        // these object have all 3 positions + 2 textures + 3 normals
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        const sizeofFloat = Float32Array.BYTES_PER_ELEMENT;
        const att_pos = gl.getAttribLocation(shader.program, 'position');
        gl.enableVertexAttribArray(att_pos);
        gl.vertexAttribPointer(att_pos, 3, gl.FLOAT, false, 8 * sizeofFloat, 0 * sizeofFloat);

        const att_textcoord = gl.getAttribLocation(shader.program, "texcoord");
        gl.enableVertexAttribArray(att_textcoord);
        gl.vertexAttribPointer(att_textcoord, 2, gl.FLOAT, false, 8 * sizeofFloat, 3 * sizeofFloat);

        const att_nor = gl.getAttribLocation(shader.program, 'normal');
        gl.enableVertexAttribArray(att_nor);
        gl.vertexAttribPointer(att_nor, 3, gl.FLOAT, false, 8 * sizeofFloat, 5 * sizeofFloat);

    }

    function draw() {
        gl.drawArrays(gl.TRIANGLES, 0, obj.num_triangles);
    }

    return {
        buffer: buffer,
        model: Model,
        activate: activate,
        draw: draw,
        center:center,
        min:obj.min,
        max:obj.max,
        buildShape:buildTriangleMeshShape
    }

};