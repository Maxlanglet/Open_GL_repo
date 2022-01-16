class Particles{


	constructor(nbr_particles, gl, physicsWorld, vac){
		this.nbr_particles = nbr_particles;
		this.gl = gl;
		this.particles=[];
		this.particles_comp = [];
		this.rigidBodies = [];
		this.physicsWorld=physicsWorld;
		this.vacc_radius = 3;
		this.vac = vac;
		this.shape = new Ammo.btSphereShape(0.15);
	}


	async initialize(){

		for(var i = 0;i<this.nbr_particles;i++){

			this.object_loader = new ObjectLoader();


			await this.object_loader.constructorAsync(this.gl,"../Objects/part.obj", "../Objects/Room-SW/textures/Yellow.png");
            this.particles.push(this.object_loader);
            //this.particles_comp.push(sphere_shader_comps);

            var pos1=(0.5-Math.random())*20;
            var pos2=Math.random()*10;
            var pos3=(0.5-Math.random())*20;

            //console.log(pos1, pos2);

            var newPos = glMatrix.vec3.fromValues(pos1,pos2,pos3);
            //var shape = new Ammo.btBoxShape(new Ammo.btVector3());

            this.particles[i].setPosition(newPos);
            this.particles[i].createRigidBody(this.physicsWorld,0.01,this.particles[i].getPos(),this.shape);

        }

        // particles_comp.push(sphere_shader_comps);


        //var shader_lamb = make_shader(this.gl, shader_V_lamb,shader_F_lamb);
	}


	async update(rigidBodies, rigidBodiesBullet, shader_lamb, camera,physicWorld){
		//Setting velocity to 0 in case of going too far
		var pos = this.particles[0].getPos();
		for (var i = this.particles.length - 1; i >= 0; i--) {
			pos = this.particles[i].getPos();
			for (var n = 2; n >= 0; n--) {
				if (Math.abs(pos[n])>20){
					this.particles[i].getRigidBody().setLinearVelocity(new Ammo.btVector3(0,0,0));
				}
			}
		}
		//to respawn particles
		var dists = [];
		for (var i = this.particles.length - 1; i >= 0; i--) {

			//Euclidean distance from the vac to the particle
			var dist = Math.sqrt(Math.pow(this.vac.getPos()[0]-this.particles[i].getPos()[0],2)
				+Math.pow(this.vac.getPos()[1]-this.particles[i].getPos()[1],2)+Math.pow(this.vac.getPos()[2]-this.particles[i].getPos()[2],2));


			if (dist<=this.vacc_radius && dist>0.4){
				var rigid = this.particles[i].getRigidBody();
				rigid.setLinearVelocity(calculate_velocity(this.vac.getPos(),this.particles[i].getPos()));
			}

			else if (dist<=0.4){
				//Keeping track for the particles to despawn
				dists.push(i);
			}
		}

		for (var n = dists.length - 1; n >= 0; n--) {

			var index = rigidBodiesBullet.indexOf(rigidBodiesBullet.find(el => el == this.particles[dists[n]].getRigidBody()));
			if (index > -1) {
				var pos1=(0.5-Math.random())*10;
				var pos2=30;
				var pos3=(0.5-Math.random())*10;
				//rigidBodiesBullet[index].setPosition(new Ammo.btVector3(pos1,pos2,pos3));
				rigidBodiesBullet[index].setLinearVelocity(new Ammo.btVector3(pos1,pos2,pos3));
				/*let tmpTrans = new Ammo.btTransform();
				tmpTrans.setIdentity();
				tmpTrans.setRotation( new Ammo.btQuaternion( 0, 0, 0, 1 ) );
				tmpTrans.setOrigin(new Ammo.btVector3(pos1,pos2,pos3));
				rigidBodiesBullet[index].getMotionState().setWorldTransform(tmpTrans)*/
				//rigidBodiesBullet.splice(index, 1);
			}

			//Despawning the particles
			/*var index = rigidBodies.indexOf(rigidBodies.find(el => el == this.particles[dists[n]]));//find element
			if (index > -1) {
			  rigidBodies.splice(index, 1);
			}

			index = rigidBodiesBullet.indexOf(rigidBodiesBullet.find(el => el == this.particles[dists[n]].getRigidBody()));
			if (index > -1) {
				physicWorld.removeRigidBody(rigidBodiesBullet[i]);
			  	rigidBodiesBullet.splice(index, 1);
			}

			index = this.particles.indexOf(this.particles[dists[n]]);
			if (index > -1) {
			  this.particles.splice(index, 1);
			}*/
		}
		/*shader_lamb.use();
        var unif = shader_lamb.get_uniforms();

		//Spawning new particles
		for (var i = dists.length - 1; i >= 0; i--) {
			//var object = create_object();
			var object_loader = new ObjectLoader();
			await object_loader.constructorAsync(this.gl,"../Objects/part.obj", "../Objects/Room-SW/textures/Yellow.png");
            this.particles.push(object_loader);

            var pos1=(0.5-Math.random())*20;
            var pos2=Math.random()*10;
            var pos3=(0.5-Math.random())*20;

            var newPos = glMatrix.vec3.fromValues(pos1,pos2,pos3);
            object_loader.setPosition(newPos);

           	object_loader.createRigidBody(this.physicsWorld,0.01,this.particles[this.particles.length-1].getPos(),this.shape);

            rigidBodies.push(this.particles[this.particles.length-1]);
            rigidBodiesBullet.push(this.particles[this.particles.length-1].getRigidBody());

            this.particles[this.particles.length-1].activateObject(shader_lamb, camera, unif['model']);

		}*/

	}


	spawn_particles(shader_lamb, unif, camera){

        shader_lamb.use();
        var unif = shader_lamb.get_uniforms();

        for(var i = 0;i<this.particles.length;i++){

        	this.particles[i].activateObject(shader_lamb, camera, unif['model']);
        }
	}


	get_num_part(){
		return this.nbr_particles;
	}

	get_particles(){
		return this.particles;
	}

	get_particles_rigid(){
		return this.rigidBodies;
	}

	get_pos(i){
		return this.particles[i].getPos();
	}

}


function calculate_velocity(pos1, pos2){

	velocities = [];

	var velocity = 0;

	for (var i = 2; i >= 0; i--) {
		velocity = 1/((pos1[i]-pos2[i])/10);

		if (velocity>0.5){
			velocities.push(0.5);
		}
		else if (velocity<-0.5){
			velocities.push(-0.5);
		}
		else{
			velocities.push(velocity);
		}
	}

	var ammo = new Ammo.btVector3(velocities[2], velocities[1],velocities[0]);

	return ammo;

}