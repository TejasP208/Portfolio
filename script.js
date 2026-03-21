import * as THREE from 'three';

// --- Three.js Neural Network (Hero) & Achievement Badge ---
const container = document.getElementById('three-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
mainLight.position.set(5, 10, 7);
scene.add(mainLight);

const indigoPoint = new THREE.PointLight(0x5A67D8, 1.5, 20);
indigoPoint.position.set(-5, 5, 2);
scene.add(indigoPoint);

// --- Neural Network Re-implementation ---
const particleCount = 100;
const particles = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleVelocities = [];

for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 15;
    const y = (Math.random() - 0.5) * 15;
    const z = (Math.random() - 0.5) * 10;
    
    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;
    
    particleVelocities.push({
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01
    });
}

particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

const particleMaterial = new THREE.PointsMaterial({
    color: 0x5A67D8,
    size: 0.15,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
});

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Lines connecting nearby particles
const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x5A67D8,
    transparent: true,
    opacity: 0.2
});

let lineMesh;

function updateLines() {
    if (lineMesh) scene.remove(lineMesh);
    
    const positions = particles.attributes.position.array;
    const linePositions = [];
    
    for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
            const dx = positions[i * 3] - positions[j * 3];
            const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
            const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            
            if (dist < 3) {
                linePositions.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
                linePositions.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
            }
        }
    }
    
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineMesh = new THREE.LineSegments(lineGeo, lineMaterial);
    scene.add(lineMesh);
}

camera.position.z = 10;

// Interaction
let targetX = 0;
let targetY = 0;
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    targetX = (event.clientX / window.innerWidth - 0.5) * 2;
    targetY = (event.clientY / window.innerHeight - 0.5) * 2;
});

// Animation Loop
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    mouseX += (targetX - mouseX) * 0.05;
    mouseY += (targetY - mouseY) * 0.05;

    // Update Particles
    const positions = particles.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += particleVelocities[i].x;
        positions[i * 3 + 1] += particleVelocities[i].y;
        positions[i * 3 + 2] += particleVelocities[i].z;
        
        // Bounce off boundaries
        if (Math.abs(positions[i * 3]) > 8) particleVelocities[i].x *= -1;
        if (Math.abs(positions[i * 3 + 1]) > 8) particleVelocities[i].y *= -1;
        if (Math.abs(positions[i * 3 + 2]) > 6) particleVelocities[i].z *= -1;
    }
    particles.attributes.position.needsUpdate = true;
    updateLines();
    
    // Animate Neutral Network Group
    particleSystem.rotation.y += 0.002;
    particleSystem.rotation.x += 0.001;
    if (lineMesh) {
        lineMesh.rotation.y = particleSystem.rotation.y;
        lineMesh.rotation.x = particleSystem.rotation.x;
    }
    
    // Parallax effect
    particleSystem.position.x = mouseX * 2;
    particleSystem.position.y = -mouseY * 2;
    if (lineMesh) {
        lineMesh.position.x = particleSystem.position.x;
        lineMesh.position.y = particleSystem.position.y;
    }

    renderer.render(scene, camera);
}

animate();

// Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Scroll Reveal ---
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });
revealElements.forEach(el => revealObserver.observe(el));

// --- Smooth Scrolling ---
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');

        // Only smooth scroll for local anchors
        if (targetId.startsWith('#')) {
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        }
    });
});

// --- EmailJS Initialization ---
emailjs.init("UsJlyZMKOmY2cN7jS");

// --- Contact Form Handling ---
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';

        const templateParams = {
            from_name: document.getElementById('name').value,
            reply_to: document.getElementById('email').value,
            message: document.getElementById('message').value,
        };

        emailjs.send("service_2ezsnjb", "template_vteg6it", templateParams)
            .then(() => {
                submitBtn.innerHTML = 'Message Sent! <i class="fas fa-check"></i>';
                submitBtn.style.background = '#10B981';
                contactForm.reset();
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                }, 3000);
            })
            .catch((err) => {
                console.error('EmailJS error:', err);
                submitBtn.innerHTML = 'Failed. Try Again <i class="fas fa-times"></i>';
                submitBtn.style.background = '#EF4444';
                submitBtn.disabled = false;
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                }, 3000);
            });
    });
}

