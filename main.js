//webGL

let  cubeRotation = 0.0

main();

function main () {
    const canvas = document.querySelector("#glCanvas")
    //Initialize the GL context
    const gl = canvas.getContext("webgl")

    if (gl === null) {
        alert("unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }


//Set clear color to black, fully opaque
gl.clearColor(0.0, 0.0, 0.0, 1.0)

// Clear the color buffer with specified clear color
gl.clear(gl.COLOR_BUFFER_BIT);

// Vertex shader program

const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;
    
    void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
    }
    `;

const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
        gl_FragColor = vColor;
    }
    `;

    const shaderProgram  = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor')
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    };

    const buffers = initBuffers(gl)

    let then = 0;

// Draw the scene repeatedly 
    function render(now) {
        now *= 0.001; //convert to seconds
        const deltaTime = now -then;
        then = now;

        drawScene(gl, programInfo, buffers, deltaTime)

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

}

    function initBuffers(gl) {
// Create a buffer for the square's positions
        const positionBuffer = gl.createBuffer();

//Select the positionBuffer as the one to apply buffer. Operations to from here out
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

//Now create an array of positions for the square
    const positions = [
        // Front face
        -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
    
        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0, -1.0, -1.0,
    
        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
        1.0,  1.0,  1.0,
        1.0,  1.0, -1.0,
    
        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
    
        // Right face
        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,
    
        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

// Set up some colors

        const faceColors = [
            [1.0,  1.0,  1.0,  1.0],    // Front face: white
            [1.0,  0.0,  0.0,  1.0],    // Back face: red
            [0.0,  1.0,  0.0,  1.0],    // Top face: green
            [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
            [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
            [1.0,  0.0,  1.0,  1.0],    // Left face: purple
          ];

// COnvert the array of colors into a table for all the vertices
        let colors = [];

        for (let j = 0; j < faceColors.length; ++j){
            const c = faceColors[j];
        

// Repeat each color four times fo the four vertices of the face
        colors = colors.concat(c, c, c, c);
    }

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

// This array defines each face as two triangles, using the indices into the vertex array to specify each triangle's position
        const indices = [
            0,  1,  2,      0,  2,  3,    // front
            4,  5,  6,      4,  6,  7,    // back
            8,  9,  10,     8,  10, 11,   // top
            12, 13, 14,     12, 14, 15,   // bottom
            16, 17, 18,     16, 18, 19,   // right
            20, 21, 22,     20, 22, 23,   // left
        ];

// No send the element array to GL
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

        return{
            position: positionBuffer,
            color: colorBuffer,
            indices: indexBuffer,
        };
    }

//Rendering the scene
    function drawScene(gl, programInfo, buffers, deltaTime) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)

// CLear the canvbas before we start drawing on it
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

// Create a perspective matrix
        const fieldOfView = 45 * Math.PI / 180;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)

// The center of the scene
        const modelViewMatrix = mat4.create();

// Move the drawing position a bit to where we want to start drawint the square
        mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);
        mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 0, 1]);
        mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation * .7, [0, 1, 0]);

// Buffer into the vertexPosition attribute
        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;

            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
        }
        {
            const numComponents = 4;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;

            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, numComponents, type, normalize, stride, offset);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor)
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

// Tell WebGl to use our program when drawing
        gl.useProgram(programInfo.program);

// Se the shader uniforms
        gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix)

        {
            const vertexCount = 36;
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }

        cubeRotation += deltaTime;

    }

    function initShaderProgram(gl, vsSource, fsSource) {
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

// Create the shader program

        const shaderProgram = gl.createProgram()
        gl.attachShader(shaderProgram, vertexShader)
        gl.attachShader(shaderProgram, fragmentShader)
        gl.linkProgram(shaderProgram)

//if creating the shader program failed, alert

        if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
            alert('Unable to initialize the shader program: ' + gl.getPorgramInfoLog(shaderProgram));
            return null;
        }

        return shaderProgram;
    }

// creates a shader of the given type, uploads the source and compiles it

    function loadShader(gl, type, source) {
        const shader = gl.createShader(type)

    // Send the source to the shader object

    gl.shaderSource(shader, source)

    //Compile the shader program

    gl.compileShader(shader);

    //See if it compiled successfully

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader))
        gl.deleteShader(shader);
        return null;
    }

    return shader;
 }

