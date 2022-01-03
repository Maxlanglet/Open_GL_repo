var make_vacuum=function(vac_obj,vac_pos){

    function get_pos(){
    	return vac_pos;
    }

    function rotate(rad){
        glMatrix.mat4.rotateY(vac_obj.model,vac_obj.model,rad)
    }

    function translate_model(tmp){
    	glMatrix.mat4.translate(vac_obj.model,vac_obj.model,tmp);
    }

    function translate_pos(tmp){
        vac_pos = glMatrix.vec3.add(vac_pos, vac_pos, tmp);
    }

	return {
		translate_model: translate_model,
        translate_pos:translate_pos,
		get_pos: get_pos,
        rotate: rotate
	}
};