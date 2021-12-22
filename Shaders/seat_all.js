var load_shader_seats = async function(gl) {
    const shader_V = `
      attribute vec3 position;
      attribute vec2 texcoord;
      attribute vec3 normal;
      varying vec3 v_diffuse;

      uniform mat4 M;
      uniform mat4 itM;  // inverse transpose model!
      uniform mat4 V;
      uniform mat4 P;

      uniform vec3 u_light_pos;

      varying vec2 v_texcoord;
      void main() {
        //Model - Position
        vec4 frag_coord = M*vec4(position, 1.0);
        gl_Position = P*V*frag_coord;

        //Normal
        vec3 norm = vec3(itM * vec4(normal, 1.0));

        //Gouraud diffuse
        vec3 L = normalize(u_light_pos - frag_coord.xyz);
        float diffusion = max(0.0, dot(norm, L));
        v_diffuse = vec3(diffusion);

        //Texture
        v_texcoord = texcoord;
      }
    `;

    const shader_F = `
      precision mediump float;
      varying vec3 v_diffuse;
      
      float ambient_l = 0.2;
      
      varying vec2 v_texcoord;
      uniform sampler2D u_texture;
      
      void main() {
        vec4 texture = texture2D(u_texture, vec2(v_texcoord.x, 1.0-v_texcoord.y));
        vec3 color = vec3(ambient_l)+v_diffuse;
        gl_FragColor = vec4(color, 1.0)*texture;
      }
    `;

    const seat_texture =  make_texture(gl,"../Objects/Room-SW/textures/MaterialSofa_Base_color.png");
    const light_pos = glMatrix.vec3.fromValues(1.0, 0.0, -1.8);

    function shader_activate(shader,mesh,pos_model) {
        //itM matrix
        var u_itM = gl.getUniformLocation(shader.program, "itM")
        var itM = glMatrix.mat4.create();
        itM = glMatrix.mat4.invert(itM, mesh.model);
        itM = glMatrix.mat4.transpose(itM, itM);
        gl.uniformMatrix4fv(u_itM, false, itM);
        //Model
        gl.uniformMatrix4fv(pos_model, false, mesh.model);
        //Light Pos
        u_light_pos = gl.getUniformLocation(shader.program, 'u_light_pos');
        gl.uniform3fv(u_light_pos, light_pos);

        //Texture
        u_tex = gl.getUniformLocation(shader.program, 'u_texture');
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, seat_texture);
        gl.uniform1i(u_tex, 0);
    }
    return {
        shader_v: shader_V,
        shader_f: shader_F,
        shader_activate: shader_activate
    }
}