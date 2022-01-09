class ObjectLoader {
    constructor() {
    }

    async constructorAsync(gl,meshName,textureName,shapeName,isCubemap=false,coef_refl= 0,needCenter=true,coef_emit=0.0) {
        this.mesh = await load_obj(meshName);
        this.obj = await make_object(gl, this.mesh);
        if(needCenter)
            this.center = glMatrix.vec3.fromValues(this.obj.center[0],this.obj.center[1],this.obj.center[2]);
        else
            this.center = glMatrix.vec3.create();

        if (isCubemap === true)
            this.shaderComps = await load_shader_cubemap(gl, textureName,coef_refl=coef_refl,coef_emit=coef_emit);
        else
            this.shaderComps = await load_shader_lamb(gl, textureName,1.0,coef_refl,coef_emit);

        this.shapeName = shapeName;
        this.tmpOpVec3 = glMatrix.vec3.create();
        this.tmpOpQuat = glMatrix.quat.create();
        this.rot = glMatrix.quat.create();
        this.tmpOpMat4 = glMatrix.mat4.create();
        this.prevRot = glMatrix.quat.create();
        this.prevPos = glMatrix.vec3.create();
    }

    activateObject(shader,camera,posModel){
        this.obj.activate(shader);
        this.shaderComps.shader_activate(shader, this.obj, posModel, camera.get_position());
        this.obj.draw();

    }

    async getShape(scaleFactor){return await this.obj.buildShape(scaleFactor,this.shapeName);}

    getCenter(){return this.center;}

    createRigidBody(physicsWorld,mass,origin,shape){
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( origin[0],origin[1],origin[2] ) );
        transform.setRotation( new Ammo.btQuaternion( 0, 0, 0, 1 ) );
        let motionState = new Ammo.btDefaultMotionState( transform );

        //Shape of the vac object
        //let colShape = new Ammo.btBoxShape( new Ammo.btVector3( 0.15, 1.0, 0.1 ) );
        let colShape = shape;
        colShape.setMargin( 0.05 );

        let localInertia = new Ammo.btVector3( 0, 0, 0 );
        colShape.calculateLocalInertia( mass, localInertia );

        let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
        this.body = new Ammo.btRigidBody( rbInfo );

        this.body.setActivationState(4);
        physicsWorld.addRigidBody( this.body );
    }


    getRigidBody(){return this.body;}

    getModel(){return this.obj.model;}

    getPos(){return glMatrix.mat4.getTranslation(glMatrix.vec3.create(),this.obj.model);}

    getPrevPos(){
        return this.prevPos;
    }

    getRotation(){
        return glMatrix.mat4.getRotation(glMatrix.quat.create(),this.obj.model);
    }

    getTransVec(){
        return glMatrix.vec3.sub(glMatrix.vec3.create(),this.getPos(),this.prevPos);
    }

    rotateY(rad){
        if (rad !== 0) {
            var quatFromRad = glMatrix.quat.fromEuler(glMatrix.quat.create(),0,rad*360/6.28,0);
            glMatrix.mat4.fromRotationTranslation(this.obj.model,quatFromRad,this.getPos());}
    }

    translatePos(vecTrans){
        glMatrix.mat4.getTranslation(this.prevPos,this.obj.model);
        glMatrix.mat4.translate(this.obj.model,this.obj.model,vecTrans);
    }

    rotateModel(quatRot){

    }

    getMinPos(){
        return this.obj.min;
    }

    getMaxPos(){return this.obj.max;}

    setModel(newModel){
        this.prevPos = this.getPos();
        this.obj.model = newModel;
    }

    setRotation(newRot){
        if(!glMatrix.quat.equals(newRot,this.getRotation())) {
            glMatrix.mat4.fromRotationTranslation(this.obj.model, newRot, this.getPos());
        }
    }

    setPosition(newPos){
        glMatrix.mat4.getTranslation(this.prevPos,this.obj.model);
        glMatrix.vec3.sub(newPos,newPos,this.center);
        if(!glMatrix.vec3.equals(newPos,this.getPos())) {
            glMatrix.mat4.fromRotationTranslation(this.obj.model,this.getRotation(),newPos);
        }
    }
}