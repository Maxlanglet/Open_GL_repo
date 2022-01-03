const shader_V_lamb = `
      #define NB_LIGHTS 13

      attribute vec3 position;
      attribute vec2 texcoord;
      attribute vec3 normal;
      
      varying vec3 v_diffuse;
      varying vec3 v_reflective;

      uniform mat4 M;
      uniform mat4 itM;  // inverse transpose model!
      uniform mat4 V;
      uniform mat4 P;

      uniform vec3 view_dir;
      uniform vec3 u_lights_pos[NB_LIGHTS];
      uniform float coef_att_const;
      uniform float coef_att_linear;
      uniform float coef_att_quadratic;
      
      varying vec2 v_texcoord;
      void main() {
        //Model - Position
        vec4 frag_coord = M*vec4(position, 1.0);
        gl_Position = P*V*frag_coord;

        //Normal
        vec3 norm = vec3(itM * vec4(normal, 1.0));
        
        vec3 diff = vec3(0.0);
        vec3 refl = vec3(0.0);
        for(int i = 0; i<NB_LIGHTS;i++){
            //Distance
            float dist_light = distance(u_lights_pos[i],frag_coord.xyz);
            float att_coef = 1.0/(coef_att_const+coef_att_linear*dist_light+coef_att_quadratic*dist_light*dist_light);
            //Gouraud diffuse
            vec3 L = normalize(u_lights_pos[i] - frag_coord.xyz);
            float prod_vec = max(0.0, dot(norm, L));
            diff += vec3(prod_vec)*att_coef;
            //Reflec
            vec3 R = reflect(-L,norm);
            vec3 view_dir = normalize(view_dir.xyz - frag_coord.xyz);
            refl += vec3(pow(max(0.0,dot(R,view_dir)),32.0))*att_coef;
        }
        v_diffuse = diff;
        v_reflective = refl;
        //Texture
        v_texcoord = texcoord;
      }
    `;

const shader_F_lamb = `
      precision mediump float;
      
      float ambient_l = 0.2;
      
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
        gl_FragColor = (vec4(vec3(coef_emitted),1.0) + vec4(vec3(ambient_l),1.0) + diff_refl)*texture;
      }
    `;


var load_shader_lamb = async function(gl,path_texture,coef_diff=1.0,coef_refl=0.3,coef_emit=0.0,coef_att_const=0.55,coef_att_linear=0.2,coef_att_quadratic=0.4) {
    const texture =  make_texture(gl,path_texture);
    const lights_pos = [glMatrix.vec3.fromValues(4.5501, 2.2558, 4.153),
        glMatrix.vec3.fromValues(-6.25, 2.3552, 4.3568),
         glMatrix.vec3.fromValues(-0.28676, 2.7222, 4.2632),
         glMatrix.vec3.fromValues(-12.289, 1.455, 8.5388),
        glMatrix.vec3.fromValues(-6.25, 2.2352, 4.3568),
        glMatrix.vec3.fromValues(4.488, 2.21, -5.2663),
         glMatrix.vec3.fromValues(-0.76692, 1.93777, -5.3409),
        glMatrix.vec3.fromValues(-6.8849, 1.9305, -5.3305),
        glMatrix.vec3.fromValues(-12.099, 1.9062, -5.0832),
        glMatrix.vec3.fromValues(16.873, 1.9922, -0.90347),
        glMatrix.vec3.fromValues(11.343, 1.9873, -6.3348),
        glMatrix.vec3.fromValues(8.4784, 1.9577, 7.9113),
        glMatrix.vec3.fromValues(-15.096, 1.9645, -3.22253)];

    const NB_LIGHTS = lights_pos.length;

    let isFirst = true;
    var u_view_dir,coef_diff_loc,coef_refl_loc,coef_emit_loc, u_itM,u_lights_pos,u_tex,coef_att_const_loc,coef_att_linear_loc,coef_att_quadratic_loc = null;

    function getLocation(shader){
        u_view_dir = gl.getUniformLocation(shader.program, 'view_dir');
        coef_att_const_loc = gl.getUniformLocation(shader.program,"coef_att_const");
        coef_att_linear_loc = gl.getUniformLocation(shader.program,"coef_att_linear");
        coef_att_quadratic_loc = gl.getUniformLocation(shader.program,"coef_att_quadratic");
        coef_diff_loc = gl.getUniformLocation(shader.program,"coef_diff");
        coef_refl_loc = gl.getUniformLocation(shader.program,"coef_refl");
        coef_emit_loc = gl.getUniformLocation(shader.program,"coef_emitted");
        u_itM = gl.getUniformLocation(shader.program, "itM");
        u_lights_pos = [];
        for(let i = 0; i<NB_LIGHTS;i++)
            u_lights_pos.push(gl.getUniformLocation(shader.program, 'u_lights_pos['+i.toString()+']'));
        u_tex = gl.getUniformLocation(shader.program, 'u_texture');
        isFirst = false;
    }

    function shader_activate(shader,mesh,pos_model,view_dir) {
        if(isFirst) getLocation(shader);

        gl.uniform3fv(u_view_dir, view_dir);
        //Coef Light
        gl.uniform1f(coef_att_const_loc,coef_att_const);
        gl.uniform1f(coef_att_linear_loc,coef_att_linear);
        gl.uniform1f(coef_att_quadratic_loc,coef_att_quadratic);
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
        for(let i = 0; i<NB_LIGHTS;i++)
            gl.uniform3fv(u_lights_pos[i], lights_pos[i]);
        //Texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(u_tex, 0);
    }
    return {
        shader_activate: shader_activate
    }
};