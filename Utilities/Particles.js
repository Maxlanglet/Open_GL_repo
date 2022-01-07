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
	}


	async initialize(){

		for(var i = 0;i<this.nbr_particles;i++){

			this.object_loader = new ObjectLoader();


			await this.object_loader.constructorAsync(this.gl,"../Objects/part.obj", "../Objects/Room-SW/textures/Yellow.png");

			// var sphere = await load_obj("../Objects/part.obj");
			// var sphere_obj = await make_object(this.gl, sphere);


			// var sphere_shader_comps = await load_shader_lamb(this.gl,"../Objects/Room-SW/textures/Yellow.png"); //See for colors

			//this.object_loader.createRigidBody(this.physicsWorld,0.1,this.particles[i].getPos(),shape);
            this.particles.push(this.object_loader);
            //this.particles_comp.push(sphere_shader_comps);

            var pos1=Math.random()*20;
            var pos2=Math.random()*20;
            var pos3=Math.random()*20;

            //console.log(pos1, pos2);

            var newPos = glMatrix.vec3.fromValues(pos1,0,pos2);
            //var shape = new Ammo.btBoxShape(new Ammo.btVector3());
            var shape = new Ammo.btSphereShape(0.15);

            this.particles[i].setPosition(newPos);

            this.particles[i].createRigidBody(this.physicsWorld,0.01,this.particles[i].getPos(),shape);
            //this.rigidBodies.push(this.particles[i].createRigidBody(this.physicsWorld,0.1,newPos,shape));

            //glMatrix.mat4.translate(this.particles[i].model,this.particles[i].model,glMatrix.vec3.fromValues(pos1,0.15,pos2));
            //glMatrix.mat4.multiplyScalar(this.particles[i].model, this.particles[i].model, 0.1);

        }

        // particles_comp.push(sphere_shader_comps);


        //var shader_lamb = make_shader(this.gl, shader_V_lamb,shader_F_lamb);
	}


	update(){
		//to respawn particles
		for (var i = this.particles.length - 1; i >= 0; i--) {

			//Euclidean distance from the vac to the particle
			var dist = Math.sqrt(Math.pow(this.vac.getPos()[0]-this.particles[i].getPos()[0],2)
				+Math.pow(this.vac.getPos()[1]-this.particles[i].getPos()[1],2)+Math.pow(this.vac.getPos()[2]-this.particles[i].getPos()[2],2));


			if (dist<=this.vacc_radius){
				var rigid = this.particles[i].getRigidBody();
				rigid.setLinearVelocity(new Ammo.btVector3(calculate_velocity(this.vac.getPos()[0],this.particles[i].getPos()[0])
					,calculate_velocity(this.vac.getPos()[1],this.particles[i].getPos()[1]),calculate_velocity(this.vac.getPos()[2],this.particles[i].getPos()[2])));
			}
		}

	}


	spawn_particles(shader_lamb, view, projection, camera){

        shader_lamb.use();
        var unif = shader_lamb.get_uniforms();
        this.gl.uniformMatrix4fv(unif['view'], false, view);
        this.gl.uniformMatrix4fv(unif['proj'], false, projection);

        for(var i = 0;i<this.particles.length;i++){

        	this.particles[i].activateObject(shader_lamb, camera, unif['model']);
            // this.particles[i].activate(shader_lamb);
            // this.particles_comp[i].shader_activate(shader_lamb,this.particles[i],unif['model'],camera.get_position());
            // this.particles[i].draw();
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

	console.log(Math.abs((pos1-pos2)/10));
	var velocity = -Math.abs((pos1-pos2)/10);

	if (velocity>0.5){
		return 0.5;
	}
	else{
		return velocity;
	}

}