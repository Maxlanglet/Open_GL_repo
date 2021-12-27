const shader_V_lamb = `
      attribute vec3 position;
      attribute vec2 texcoord;
      attribute vec3 normal;
      
      varying vec3 v_diffuse;
      varying vec3 v_reflective;

      uniform mat4 M;
      uniform mat4 itM;  // inverse transpose model!
      uniform mat4 V;
      uniform mat4 P;

       float max_dist = 15.0;

      uniform vec3 view_dir;
      uniform vec3 u_light_pos;
      
      varying vec2 v_texcoord;
      void main() {
        //Model - Position
        vec4 frag_coord = M*vec4(position, 1.0);
        gl_Position = P*V*frag_coord;

        //Normal
        vec3 norm = vec3(itM * vec4(normal, 1.0));
        
        //Distance
        float dist_light = distance(u_light_pos,frag_coord.xyz);
        
        //Gouraud diffuse
        vec3 L = normalize(u_light_pos - frag_coord.xyz);
        float prod_vec = max(0.0, dot(norm, L));
        v_diffuse = vec3(prod_vec)*(max_dist-dist_light)/max_dist;
        
        //Reflec
        vec3 R = reflect(-L,norm);
        vec3 view_dir = normalize(view_dir.xyz - frag_coord.xyz);
        v_reflective = vec3(max(0.0,dot(R,view_dir)))*(max_dist-dist_light)/max_dist;

        //Texture
        v_texcoord = texcoord;
      }
    `;

const shader_F_lamb = `
      precision mediump float;
      
      float ambient_l = 0.3;
      
      uniform float coef_emitted;
      uniform float coef_diff;
      uniform float coef_refl;
      
      varying vec3 v_reflective;
      varying vec3 v_diffuse;
      varying vec2 v_texcoord;
      uniform sampler2D u_texture;
      
      void main() {
        vec4 texture = texture2D(u_texture, vec2(v_texcoord.x, 1.0-v_texcoord.y));
        vec4 diff_refl = vec4(v_diffuse*coef_diff + v_reflective*coef_refl,1.0);
        gl_FragColor = vec4(vec3(coef_emitted),1.0) + (vec4(vec3(ambient_l),1.0) + diff_refl)*texture;
      }
    `;

var load_shader_lamb = async function(gl,path_texture,coef_diff=1.0,coef_refl=0.8,coef_emit=0.0) {
    const texture =  make_texture(gl,path_texture);
    const light_pos = glMatrix.vec3.fromValues(1.0, 0.0, -1.8);

    let isFirst = true;
    var u_view_dir,coef_diff_loc,coef_refl_loc,coef_emit_loc, u_itM,u_light_pos,u_tex = null;

    function getLocation(shader){
        u_view_dir = gl.getUniformLocation(shader.program, 'view_dir');
        coef_diff_loc = gl.getUniformLocation(shader.program,"coef_diff");
        coef_refl_loc = gl.getUniformLocation(shader.program,"coef_refl");
        coef_emit_loc = gl.getUniformLocation(shader.program,"coef_emitted");
        u_itM = gl.getUniformLocation(shader.program, "itM");
        u_light_pos = gl.getUniformLocation(shader.program, 'u_light_pos');
        u_tex = gl.getUniformLocation(shader.program, 'u_texture');
        isFirst = false;
    }

    function shader_activate(shader,mesh,pos_model,view_dir) {
        if(isFirst) getLocation(shader);

        gl.uniform3fv(u_view_dir, view_dir);
        //Coef Light
        gl.uniform1f(coef_diff_loc,coef_diff);
        gl.uniform1f(coef_refl_loc,coef_refl);
        gl.uniform1f(coef_emit_loc,coef_emit);
        //itM matrix
        var itM = glMatrix.mat4.create();
        itM = glMatrix.mat4.invert(itM, mesh.model);
        itM = glMatrix.mat4.transpose(itM, itM);
        gl.uniformMatrix4fv(u_itM, false, itM);
        //Model
        gl.uniformMatrix4fv(pos_model, false, mesh.model);
        //Light Pos
        gl.uniform3fv(u_light_pos, light_pos);
        //Texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(u_tex, 0);
    }
    return {
        shader_activate: shader_activate
    }
};