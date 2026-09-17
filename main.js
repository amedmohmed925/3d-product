document.addEventListener("DOMContentLoaded", () => {
    // --- Canvas & Video Sequence Setup ---
    const canvas = document.getElementById("hero-canvas");
    const context = canvas.getContext("2d");
    
    // Total frames extracted from video
    // Reduced slightly to avoid end-of-video compression artifacts
    const frameCount = 188;
    
    // Array to hold the preloaded image objects
    const images = [];
    
    // Generate the path to the frames (assuming names like frame_001.png, frame_002.png)
    const currentFrame = index => (
        `assets/frames/frame_${index.toString().padStart(3, '0')}.png`
    );
    
    // Preload frames
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
    }
    
    // Object to track current scroll progress
    let animationState = {
        frameIndex: 0,
        targetFrameIndex: 0
    };
    
    // Helper function to scale image to fit canvas contain style
    function drawImageProp(ctx, img, x, y, w, h) {
        if (arguments.length === 2) {
            x = y = 0;
            w = ctx.canvas.width;
            h = ctx.canvas.height;
        }

        var iw = img.width,
            ih = img.height,
            r = Math.min(w / iw, h / ih),
            nw = iw * r,   // new prop. width
            nh = ih * r,   // new prop. height
            nx = x + (w - nw) / 2,
            ny = y + (h - nh) / 2;

        ctx.drawImage(img, 0, 0, iw, ih, nx, ny, nw, nh);
    }

    // Set canvas dimensions and redraw on resize
    function resizeCanvas() {
        const glassWindow = document.querySelector('.glass-window');
        
        // Dynamically size the glass window to match the video aspect ratio
        if (images[0] && images[0].complete && images[0].width) {
            const imgAspect = images[0].width / images[0].height;
            const maxW = window.innerWidth * 0.9;
            const maxH = window.innerHeight * 0.9;
            const screenAspect = maxW / maxH;
            
            if (imgAspect > screenAspect) {
                // Image is wider, constrain by width
                glassWindow.style.width = maxW + 'px';
                glassWindow.style.height = (maxW / imgAspect) + 'px';
            } else {
                // Image is taller, constrain by height
                glassWindow.style.height = maxH + 'px';
                glassWindow.style.width = (maxH * imgAspect) + 'px';
            }
        }
        
        const container = document.querySelector('.canvas-container');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        renderFrame();
    }
    
    // Render the specific frame to canvas
    function renderFrame() {
        const index = Math.round(animationState.frameIndex);
        if (!images[index]) return;
        
        // Wait for image to load if it hasn't already
        if (images[index].complete) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawImageProp(context, images[index]);
        } else {
            images[index].onload = () => {
                context.clearRect(0, 0, canvas.width, canvas.height);
                drawImageProp(context, images[index]);
            };
        }
    }
    
    // Initial setup once the first image is loaded
    images[0].onload = () => {
        resizeCanvas();
    };
    window.addEventListener('resize', resizeCanvas);
    // Smooth animation loop
    function updateAnimation() {
        // Lerp the frame index for smooth movement
        const diff = animationState.targetFrameIndex - animationState.frameIndex;
        
        // Use a tiny threshold to stop animating when very close
        if (Math.abs(diff) > 0.1) {
            animationState.frameIndex += diff * 0.1; // 0.1 is the easing factor (lower = smoother/slower)
            renderFrame();
        } else if (Math.abs(diff) > 0 && Math.abs(diff) <= 0.1) {
            animationState.frameIndex = animationState.targetFrameIndex;
            renderFrame();
        }
        
        requestAnimationFrame(updateAnimation);
    }
    
    // Start the animation loop
    updateAnimation();
    
    const scrollContainer = document.querySelector('.glass-window');

    // Scroll Event Listener to update frame based on scroll percentage
    scrollContainer.addEventListener('scroll', () => {
        const scrollTop = scrollContainer.scrollTop;
        
        // Calculate max scrollable height
        // Subtract container height from scrollable height
        const maxScrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        
        if (maxScrollTop <= 0) return;
        
        // Calculate the percentage scrolled (0 to 1)
        const scrollFraction = scrollTop / maxScrollTop;
        
        // Map fraction to the corresponding frame index (0 to frameCount - 1)
        const frameIndex = Math.min(
            frameCount - 1,
            Math.floor(scrollFraction * frameCount)
        );
        
        // Update target frame for the animation loop to catch up to
        animationState.targetFrameIndex = frameIndex;
    });


    // --- Intersection Observer for Animations ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observerOptions = {
        root: document.querySelector('.glass-window'),
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                // Optional: remove class when scrolling away so it animates again when scrolling back
                entry.target.classList.remove('is-visible');
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });

});
