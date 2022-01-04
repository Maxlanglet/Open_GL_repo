var make_vacuum=function(vac_obj,vac_pos){
    let prev_vac = vac_pos;
    let prev_rot = [0,0,0,0];

    function get_pos(){
    	return getVec3(vac_pos);
    }

    function getPrevPos(){
        return getVec3(prev_vac);
    }

    function rotate(rad){
        glMatrix.mat4.rotateY(vac_obj.model,vac_obj.model,rad)
    }

    function translate_model(tmp){
    	glMatrix.mat4.translate(vac_obj.model,vac_obj.model,getVec3(tmp));
    }

    function translate_pos(tmp){
        for(let i = 0;i<vac_pos.length;i++)
            vac_pos[i] += tmp[i];
    }

    function getVec3(pos){
        return glMatrix.vec3.fromValues(pos[0],pos[1],pos[2]);
    }

    function sub_list(a,b){
        var res= [0,0,0];
        for(let i = 0;i<a.length;i++)
            res[i] = a[i] - b[i];
        return res
    }

    function getQuat(rot) {
        return glMatrix.quat.fromValues(rot[0],rot[1],rot[2],rot[3]);
    }

    function setRotation(newRot){
        var rot = glMatrix.mat4.fromQuat(glMatrix.mat4.create(),getQuat(sub_list(newRot,prev_rot)));
        glMatrix.mat4.multiply(vac_obj.model,vac_obj.model,rot);
        prev_rot = newRot;
    }

    function setPosition(new_pos) {
        prev_vac = vac_pos;
        translate_model(sub_list(new_pos,vac_pos));
        vac_pos = new_pos;
    }

	return {
		translate_model: translate_model,
        translate_pos:translate_pos,
		get_pos: get_pos,
        rotate: rotate,
        setPosition: setPosition,
        getPrevPos:getPrevPos,
        setRotation:setRotation
	}
};