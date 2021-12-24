var load_obj = async function(name = 'bunny_small.obj',is_multiple=0) {
    async function load_mesh(string) {
      var lines = string.split("\n");
      var positions = [];
      var normals = [];
      var textures = [];
      var vertices = [];

      console.log("Lines : ", lines.length);
     
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
      console.log("Vertices : ", vertices.length);
      console.log("Loaded mesh with " + vertexCount + " vertices");
      return {
        buffer: new Float32Array(vertices),
        num_triangles: vertexCount
      };
    }

    if (is_multiple === 0){
        const response = await fetch(name);
        var text = await response.text();
        var ret = await load_mesh(text);}
    else {
        var ret = []
        for (var i = 1; i <= is_multiple; i++) {
            var tmp = name.split(".obj")[0] + i.toString() + ".obj"
            const response = await fetch(tmp);
            var text = await response.text();
            ret.push(await load_mesh(text))
        }
    }
    return ret;
}

var make_objects = async function(gl, objs) {
    var mesh = []
    for(var i = 0;i<objs.length;i++){
        var obj = await objs[i]
        mesh.push(await make_object(gl,obj))
    }
    return mesh
}

var make_object = async function(gl, obj) {
    // We need the object to be ready to proceed:
    obj = await obj;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, obj.buffer, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var Model = glMatrix.mat4.create();
    Model = glMatrix.mat4.translate(Model, Model, glMatrix.vec3.fromValues(0.5, -0.5, -1.0));

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
    }

}