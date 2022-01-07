var make_camera = function(canvas, positionInit, upInit, yaw, pitch,vac) {

    const CameraMovement = {
        FORWARD: 1,
        BACKWARD: 2,
        LEFT: 3,
        RIGHT: 4,
        UP: 5,
        DOWN:6,
    };

    let origin = glMatrix.vec3.fromValues(0,0,0);
    var front_origin = glMatrix.vec3.fromValues(0,0,1);
    let front = glMatrix.vec3.copy(glMatrix.vec3.create(),front_origin);
    var right_origin = glMatrix.vec3.fromValues(-1,0,0);
    let right = glMatrix.vec3.copy(glMatrix.vec3.create(),right_origin);

    let position = glMatrix.vec3.add(glMatrix.vec3.create(),vac.getPos(),positionInit);
    let up = glMatrix.vec3.copy(glMatrix.vec3.create(),upInit);
    var movement_speed = 0.5;
    var mouse_sensitivity = 0.5;
    var zoom = 0.0; // Not used anymore

    let yawr = 0;
    let prev_yawr = 0;
    let pitchr = 0;

    let max_pitch = 50.0;

    var dt = 0.0;

    var mouse_prev_x = 0.0;
    var mouse_prev_y = 0.0;

    const timeActionConst = 0.05;
    let dicTimeDir={
        "FORWARD": 0,
        "BACKWARD": 0,
        "LEFT": 0,
        "RIGHT": 0,
        "UP": 0,
        "DOWN":0,
    };
    let dictDirOrign = {
        "FORWARD": glMatrix.vec3.fromValues(0,0,1),
        "BACKWARD": glMatrix.vec3.fromValues(0,0,-1),
        "LEFT": glMatrix.vec3.fromValues(1,0,0),
        "RIGHT": glMatrix.vec3.fromValues(-1,0,0),
        "UP": glMatrix.vec3.fromValues(0,1,0),
        "DOWN":glMatrix.vec3.fromValues(0,-1,0),
    };

    let dictDir = {
        "FORWARD": glMatrix.vec3.fromValues(0,0,1),
        "BACKWARD": glMatrix.vec3.fromValues(0,0,-1),
        "LEFT": glMatrix.vec3.fromValues(1,0,0),
        "RIGHT": glMatrix.vec3.fromValues(-1,0,0),
        "UP": glMatrix.vec3.fromValues(0,1,0),
        "DOWN":glMatrix.vec3.fromValues(0,-1,0),
    };

    register_keyboard();
    register_mouse();
    update_camera_vectors();

    function update(delta_time) {
        dt = delta_time;
        let objAmmo = vac.getRigidBody();
        let velocityPrev = objAmmo.getLinearVelocity();
        let velocityVector = [velocityPrev.x(),velocityPrev.y(),velocityPrev.z()];
        let velocityReset = false;
        for(var key in dicTimeDir){
            var delta = dt-dicTimeDir[key];
            if(delta <= timeActionConst && dicTimeDir[key] !== 0){
                for(var i = 0;i<velocityVector.length;i++){
                    if(dictDir[key][i] !== 0)
                        velocityVector[i] = dictDir[key][i];
                }
            }
            else if(delta > timeActionConst && dicTimeDir[key] !== 0){
                for(i = 0;i<velocityVector.length;i++){
                    if(dictDir[key][i] !== 1)
                        velocityVector[i] = 0;
                }
                dicTimeDir[key] = 0;
            }
        }
        objAmmo.setLinearVelocity(new Ammo.btVector3(velocityVector[0],velocityVector[1],velocityVector[2]));
    }

    function updatePosition(){
        var rotFromQuat = glMatrix.quat.getAxisAngle(position,vac.getRotation());
        /*if(position[0] === 1){
            glMatrix.vec3.rotateX(position,positionInit,origin,rotFromQuat);
            //glMatrix.vec3.rotateX(up,upInit,origin,rotFromQuat);
        }
         if(position[1] === 1){
            glMatrix.vec3.rotateY(position,positionInit,origin,rotFromQuat);
            //glMatrix.vec3.rotateY(up,upInit,origin,rotFromQuat);
     }
         if(position[2] === 1){
            glMatrix.vec3.rotateZ(position,positionInit,origin,rotFromQuat);
            //glMatrix.vec3.rotateZ(up,upInit,origin,rotFromQuat);
        }*/
        glMatrix.vec3.add(position,vac.getPos(),positionInit);
    }

    function register_keyboard() {
        document.addEventListener('keydown', (event) => {
            const key = event.key;

            // Remove page scrolling with arrows to handle camera
            if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
                event.view.event.preventDefault();
            }

            if (key === 's' || key === '5' || key === 'u') {
                process_keyboard("BACKWARD");
                return;
            } else if (key === 'z' || key === '8' || key === 'é') {
                process_keyboard("FORWARD");
                return;
            } else if (key === 'q' || key === '4' || key === 'a') {
                process_keyboard("LEFT");
                return;
            } else if (key === 'd' || key === '6' || key === 'i') {
                process_keyboard("RIGHT");
                return;
            }else if (key === ' ') {
                process_keyboard("UP");
                return;
            }else if (key === 'Shift') {
                process_keyboard("DOWN");
                return;
            }else if (key === 'z' && key == 'd'){
                process_keyboard("FORWARD");
                process_keyboard("RIGHT");
                return;
            }

            // TODO register_mouse not yet working
            else if (key === 'ArrowUp' || key === '+' || key === 'Add') {
                process_mouse_movement(0, 1.0);
                return;
            } else if (key === 'ArrowDown' || key === '-' || key === 'Subtract') {
                process_mouse_movement(0, -1.0);
                return;
            } else if (key === 'ArrowLeft') {
                process_mouse_movement(-1.0, 0.0);
                return;
            } else if (key === 'ArrowRight') {
                process_mouse_movement(1.0, 0);
                return;
            }
        }, false);
    }

    function register_mouse() {
        // For the mighty and worthy students that want to make
        // rotations with the mouse, you can find here a starting code.
        function getMousePos(canvas, evt) {
            var rect = canvas.getBoundingClientRect();
            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            };
        }
        canvas.addEventListener("mousemove", function( event ) {
            var pos = getMousePos(canvas, event);
            x = canvas.width / 2 - pos.x;
            y = pos.y - canvas.height / 2;
            var dx = mouse_prev_x - x;
            var dy = mouse_prev_y - y;
            //console.log(dx, dy)
            process_mouse_movement(dx, dy);
            mouse_prev_x = x;
            mouse_prev_y = y
        }, false);
    }

    function get_view_matrix() {
        var vac_pos = vac.getPos();

        let position_tmp = glMatrix.vec3.create();
        let position_final = glMatrix.vec3.create();
        glMatrix.vec3.rotateY(position_tmp,position,vac_pos,-yawr);
        glMatrix.vec3.rotateX(position_final,position_tmp,vac_pos,-pitchr);
        glMatrix.vec3.rotateY(front,front_origin,origin,-yawr);
        glMatrix.vec3.rotateY(right,right_origin,origin,-yawr);

        vac.rotateY(-yawr);

        for(var key in dictDir){
            glMatrix.vec3.rotateY(dictDir[key],dictDirOrign[key],origin,-yawr);
        }

        prev_yawr = yawr;
        View = glMatrix.mat4.create();
        View = glMatrix.mat4.lookAt(View, position_final, vac_pos, up);
        return View;
    }

    function get_projection(fov = 45.0, ratio = 1.0, near = 0.01, far = 100.0) {
        var projection = glMatrix.mat4.create();
        // You can try the zoom in radians instead of fov if you activate the zoom
        projection = glMatrix.mat4.perspective(projection, fov, ratio, near, far);
        return projection;
    }

    function process_keyboard(direction) {
        var velocity = movement_speed;// * dt;
        let tmp = glMatrix.vec3.create();

        dicTimeDir[direction] = dt;
        /*
        if (direction === CameraMovement.FORWARD) {
            /*tmp = glMatrix.vec3.scale(tmp, front_origin, velocity);
            vac.translatePos(tmp);
            updatePosition();
        }
        if (direction === CameraMovement.BACKWARD) {
            tmp = glMatrix.vec3.scale(tmp, front_origin, velocity);
            tmp = glMatrix.vec3.negate(tmp,tmp);
            vac.translatePos(tmp);
            updatePosition();
        }
        if (direction === CameraMovement.LEFT) {
            tmp = glMatrix.vec3.scale(tmp, right_origin, velocity);
            tmp = glMatrix.vec3.negate(tmp,tmp);
            vac.translatePos(tmp);
            updatePosition();
        }
        if (direction === CameraMovement.RIGHT) {
            tmp = glMatrix.vec3.scale(tmp, right_origin, velocity);
            vac.translatePos(tmp);
            updatePosition();
        }
        if (direction === CameraMovement.UP) {
            tmp = glMatrix.vec3.scale(tmp, up, velocity);
            vac.translatePos(tmp);
            updatePosition();
        }
        if (direction === CameraMovement.DOWN) {
            tmp = glMatrix.vec3.scale(tmp, up, velocity);
            tmp = glMatrix.vec3.negate(tmp,tmp);
            vac.translatePos(tmp);
            updatePosition();
        }*/
    }

    function process_mouse_movement(xoffset, yoffset, constrain_pitch = true) {
        xoffset *= mouse_sensitivity;
        yoffset *= mouse_sensitivity;

        yaw += xoffset;
        pitch += yoffset;

        // Don't flip screen if pitch is out of bounds
        if (constrain_pitch) {
            if (pitch > max_pitch) {
                pitch = max_pitch
            }
            if (pitch < -max_pitch) {
                pitch = -max_pitch
            }
        }

        //console.log("yaw and pitch : ", yaw, pitch);

        // Update front, right, up with the new Euler angles
        update_camera_vectors();
    }

    function process_mouse_scroll(yoffset) {
        zoom -= yoffset;
        if (zoom < 1.0) {
            zoom = 1.0
        }
        if (zoom > 45.0) {
            zoom = 45.0
        }
    }

    function deg2rad(deg) {
        var PI = Math.PI;
        var rad = deg * (PI / 180.0);
        return rad;
    }

    function update_camera_vectors() {

        yawr = deg2rad(yaw)
        pitchr = deg2rad(pitch)

        fx = Math.cos(yawr)* Math.cos(pitchr);
        fy = Math.sin(pitchr);
        fz = Math.sin(yawr) * Math.cos(pitchr);

        //front = glMatrix.vec3.fromValues(fx, fy, fz);
        // //front = glMatrix.vec3.normalize(front, front);

        // // recompute right, up
        //right = glMatrix.vec3.cross(right, front, world_up);
        //right = glMatrix.vec3.normalize(right, right);

        //up = glMatrix.vec3.cross(up, right, front);

    }

    function get_position() {
        return position;
    }

    function show_view_html(tag, view) {
        show_mat(tag, 'View', view);
    }


    function show_projection_html(tag, projection) {
        show_mat(tag, 'Proj', projection);
    }

    // print a float with fixed decimals
    function fl(x) {
        return Number.parseFloat(x).toFixed(3);
    }

    function show_mat(tag, name, m) {
        // WARNING: rounded fixed floating points using fl(x)
        var txt = name + ':<br />'
        txt += fl(m[0]) + ' ' + fl(m[4]) + ' ' + fl(m[ 8]) + ' ' + fl(m[12]) + '<br />'
        txt += fl(m[1]) + ' ' + fl(m[5]) + ' ' + fl(m[ 9]) + ' ' + fl(m[13]) + '<br />'
        txt += fl(m[2]) + ' ' + fl(m[6]) + ' ' + fl(m[10]) + ' ' + fl(m[14]) + '<br />'
        txt += fl(m[3]) + ' ' + fl(m[7]) + ' ' + fl(m[11]) + ' ' + fl(m[15]) + '<br />'
        tag.innerHTML = txt;
    }

    return {
        update: update,
        get_view_matrix: get_view_matrix,
        get_projection: get_projection,
        get_position: get_position,
        show_projection_html: show_projection_html,
        show_view_html: show_view_html,
        updatePosition:updatePosition,
    }
};