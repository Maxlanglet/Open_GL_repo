var make_object = function(gl, data, num_triangles) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    var Model = glMatrix.mat4.create();
    Model = glMatrix.mat4.translate(Model, Model, glMatrix.vec3.fromValues(0.5,-0.5,-1.0));
    
    function activate(shader) {
        // these object have all 3 positions + 2 textures, in practice you can add normals etc..!
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        const sizeofFloat = Float32Array.BYTES_PER_ELEMENT;
        const att_pos = gl.getAttribLocation(shader.program, 'position');
        gl.enableVertexAttribArray(att_pos);
        gl.vertexAttribPointer(att_pos, 3, gl.FLOAT, false, 5*sizeofFloat, 0*sizeofFloat);
        
        const att_textcoord = gl.getAttribLocation(shader.program, "texcoord");
        gl.enableVertexAttribArray(att_textcoord);
        gl.vertexAttribPointer(att_textcoord, 2, gl.FLOAT, false, 5*sizeofFloat, 3*sizeofFloat);
    }
    
    function draw() {
        gl.drawArrays (gl.TRIANGLES, 0, num_triangles);
    }
    
    return {
        buffer: buffer,
        model: Model,
        activate: activate,
        draw:draw,
    }

}