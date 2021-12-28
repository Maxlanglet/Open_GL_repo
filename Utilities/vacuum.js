var make_vacuum=function(vac, vac_obj, vac_shader_comps, vac_shader, gl){

	var vac = vac;
    var vac_obj = vac_obj;
    var vac_shader_comps = vac_shader_comps;
    var vac_shader = vac_shader;
    var gl = gl;

    function draw(view, projection){
    	vac_shader.use();
        var unif = vac_shader.get_uniforms();
        gl.uniformMatrix4fv(unif['view'], false, view);
        gl.uniformMatrix4fv(unif['proj'], false, projection);
        vac_obj.activate(vac_shader);
        vac_shader_comps.shader_activate(vac_shader,vac_obj.model,unif['model']);
        vac_obj.draw();
    }



    function get_shader(){
    	return vac_shader;
    }
	
    function translate(tmp){
    	vac_shader.model = glMatrix.mat4.translate(vac_obj.model,vac_obj.model,tmp);
    }


	return {
		translate: translate,
		draw: draw,
		get_shader: get_shader,
	}
}