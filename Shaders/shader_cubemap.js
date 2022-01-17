const shader_V_cubemap = `
      attribute vec3 position;
      attribute vec2 texcoord;
      attribute vec3 normal;
      varying vec3 v_texcoord;

      uniform mat4 V;
      uniform mat4 P;

      void main() {
        vec4 frag_coord = vec4(position, 1.0);
        gl_Position = (P*mat4(mat3(V))*frag_coord).xyww;
        
        //remove errors/warning
        vec3 errorHandler = (vec3(texcoord,1.0)+normal)*0.0;

        v_texcoord = position;
      }
    `;

const shader_F_cubemap = `
      precision mediump float;
      varying vec3 v_texcoord;

      uniform samplerCube u_cubemap;

      void main() {
        gl_FragColor = textureCube(u_cubemap, v_texcoord);
        //gl_FragColor = vec4(vec3(0.1,0.7,1.0)*v_texcoord,1.0);
      }
    `;


var load_shader_cubemap = async function(gl,path_texture) {
    const texture =  make_texture_cubemap(gl,path_texture);

    var u_cube = null;
    let isFirst = true;
    function getLocation(shader){
        u_cube = gl.getUniformLocation(shader.program,"u_cubemap");
        isFirst = false;
    }

    function shader_activate(shader) {
        if(isFirst) getLocation(shader);
        // Activate the texture for the cube
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.uniform1i(u_cube, 0);
    }
    return {
        shader_activate: shader_activate
    }
};