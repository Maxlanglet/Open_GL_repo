class Particles{


	constructor(nbr_particles, gl){
		this.nbr_particles = nbr_particles;
		this.gl = gl;
		this.particles=[];
		this.particles_comp = [];
	}


	async initialize(){
		for(var i = 0;i<this.nbr_particles;i++){

			var sphere = await load_obj("../Objects/part.obj");
			var sphere_obj = await make_object(this.gl, sphere);


			var sphere_shader_comps = await load_shader_lamb(this.gl,"../Objects/Room-SW/textures/Yellow.png"); //See for colors

            this.particles.push(sphere_obj);
            this.particles_comp.push(sphere_shader_comps);

            var pos1=Math.random();
            var pos2=Math.random();
            var pos3=Math.random();

            console.log(pos1, pos2);

            glMatrix.mat4.translate(this.particles[i].model,this.particles[i].model,glMatrix.vec3.fromValues(pos1,0.15,pos2));
            //glMatrix.mat4.multiplyScalar(this.particles[i].model, this.particles[i].model, 0.1);

        }

        // particles_comp.push(sphere_shader_comps);


        //var shader_lamb = make_shader(this.gl, shader_V_lamb,shader_F_lamb);
	}


	spawn_particles(shader_lamb, view, projection, camera){

        shader_lamb.use();
        var unif = shader_lamb.get_uniforms();
        this.gl.uniformMatrix4fv(unif['view'], false, view);
        this.gl.uniformMatrix4fv(unif['proj'], false, projection);

        for(var i = 0;i<this.particles.length;i++){
            this.particles[i].activate(shader_lamb);
            this.particles_comp[i].shader_activate(shader_lamb,this.particles[i],unif['model'],camera.get_position());
            this.particles[i].draw();
        }
	}

}