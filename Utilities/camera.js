var make_camera = function(canvas, position, up, yaw, pitch,f=glMatrix.vec3.fromValues(0, 0, 1.0)) {

    const CameraMovement = {
        FORWARD: 1,
        BACKWARD: 2,
        LEFT: 3,
        RIGHT: 4
    }
    var canvas = canvas;
    var position = position;
    var front = f;
    var up = up;
    var right = glMatrix.vec3.create();
    var world_up = up;

    // Euler angles
    var yaw = 90.0;
    var pitch = 0.0;
    var movement_speed = 0.045;
    var mouse_sensitivity = 0.15;
    var zoom = 0.0; // Not used anymore

    var dt = 0.0;

    var mouse_prev_x = 0.0;
    var mouse_prev_y = 0.0;

    register_keyboard();
    register_mouse();
    update_camera_vectors();

    function update(delta_time) {
        dt = delta_time;
    }

    function register_keyboard() {
        document.addEventListener('keydown', (event) => {
            const key = event.key;
            
            // Remove page scrolling with arrows to handle camera
            if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
                event.view.event.preventDefault();
            }

            if (key === 's' || key === '5' || key === 'u') {
                process_keyboard(CameraMovement.BACKWARD);
                return;
            } else if (key === 'z' || key === '8' || key === 'é') {
                process_keyboard(CameraMovement.FORWARD);
                return;
            } else if (key === 'q' || key === '4' || key === 'a') {
                process_keyboard(CameraMovement.LEFT);
                return;
            } else if (key === 'd' || key === '6' || key === 'i') {
                process_keyboard(CameraMovement.RIGHT);
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
               x = canvas.width / 2 - pos.x
               y = pos.y - canvas.height / 2
               var dx = mouse_prev_x - x
               var dy = mouse_prev_y - y
               process_mouse_movement(dx, dy)
               mouse_prev_x = x
               mouse_prev_y = y
             }, false);
    }

    function get_view_matrix() {
        center = glMatrix.vec3.create();
        center = glMatrix.vec3.add(center, position, front);
        View = glMatrix.mat4.create();
        View = glMatrix.mat4.lookAt(View, position, center, up);
        return View;
    }

    function get_projection(fov = 45.0, ratio = 1.0, near = 0.01, far = 100.0) {
        var projection = glMatrix.mat4.create();
        // You can try the zoom in radians instead of fov if you activate the zoom
        projection = glMatrix.mat4.perspective(projection, fov, ratio, near, far);
        return projection;
    }

    function process_keyboard(direction) {
        var velocity = movement_speed;
        tmp = glMatrix.vec3.create()
        if (direction == CameraMovement.FORWARD) {
            tmp = glMatrix.vec3.scale(tmp, front, velocity);
            position = glMatrix.vec3.add(position, position, tmp);
            //position += front + velocity;
        }
        if (direction == CameraMovement.BACKWARD) {
            tmp = glMatrix.vec3.scale(tmp, front, velocity);
            position = glMatrix.vec3.sub(position, position, tmp);
            //position -= front + velocity;
        }
        if (direction == CameraMovement.LEFT) {
            tmp = glMatrix.vec3.scale(tmp, right, velocity);
            position = glMatrix.vec3.sub(position, position, tmp);
            //position -= right + velocity;
        }
        if (direction == CameraMovement.RIGHT) {
            tmp = glMatrix.vec3.scale(tmp, right, velocity);
            position = glMatrix.vec3.add(position, position, tmp);
            //position += right + velocity;
        }
    }

    function process_mouse_movement(xoffset, yoffset, constrain_pitch = true) {
        xoffset *= mouse_sensitivity;
        yoffset *= mouse_sensitivity;

        yaw += xoffset;
        pitch += yoffset;

        // Don't flip screen if pitch is out of bounds
        if (constrain_pitch) {
            if (pitch > 89.0) {
                pitch = 89.0
            }
            if (pitch < -89.0) {
                pitch = -89.0
            }
        }

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

        fx = Math.cos(yawr) * Math.cos(pitchr);
        fy = Math.sin(pitchr);
        fz = Math.sin(yawr) * Math.cos(pitchr);

        front = glMatrix.vec3.fromValues(fx, fy, fz);
        front = glMatrix.vec3.normalize(front, front);

        // recompute right, up
        right = glMatrix.vec3.cross(right, front, world_up);
        right = glMatrix.vec3.normalize(right, right);

        up = glMatrix.vec3.cross(up, right, front);
        up = glMatrix.vec3.normalize(up, up);
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
    }
}