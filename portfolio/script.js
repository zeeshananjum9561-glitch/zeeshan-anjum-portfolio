// Typing Animation
new Typed("#typing", {
    strings: [
        "Computer Science Student",
    "Aspiring Full-Stack Web Developer",
    "Frontend Developer",
    "Future Freelancer",
    "Tech Content Creator"
    ],
    typeSpeed: 30,
    backSpeed: 20,
    backDelay: 1500,
    loop: true
});

// Navbar Scroll Effect
window.addEventListener("scroll", function () {
    const header = document.querySelector(".header");

    if (window.scrollY > 50) {
        header.classList.add("sticky");
    } else {
        header.classList.remove("sticky");
    }
});

const bars = document.querySelectorAll(".progress");

const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
        if(entry.isIntersecting){
            entry.target.style.animation="fillBar 2s forwards";
        }
    });
});

bars.forEach(bar=>{
    observer.observe(bar);
});
/*==================== SCROLL TO TOP ====================*/

const scrollTop = document.getElementById("scroll-top");

window.addEventListener("scroll", () => {

    if(window.scrollY > 400){

        scrollTop.classList.add("show");

    }else{

        scrollTop.classList.remove("show");

    }

});

/*==================== EMAILJS ====================*/

const contactForm = document.getElementById("contact-form");

contactForm.addEventListener("submit", function(e){

    e.preventDefault();

    emailjs.send("service_aizba1o","template_bb5ytir",{

        from_name:document.getElementById("from_name").value,

        from_email:document.getElementById("from_email").value,

        subject:document.getElementById("subject").value,

        message:document.getElementById("message").value

    })

    .then(function(){

        document.getElementById("form-status").innerHTML="✅ Message Sent Successfully!";

        contactForm.reset();

    })

    .catch(function(error){

        document.getElementById("form-status").innerHTML="❌ Failed to Send Message.";

        console.log(error);

    });

});

/*==================== CERTIFICATE POPUP ====================*/

const certificateImages = document.querySelectorAll(".certificate-image");

const modal = document.getElementById("certificate-modal");

const modalImage = document.getElementById("modal-image");

const closeModal = document.querySelector(".close-modal");

certificateImages.forEach(image=>{

    image.addEventListener("click",()=>{

        modal.style.display="flex";

        modalImage.src=image.src;

    });

});

closeModal.addEventListener("click",()=>{

    modal.style.display="none";

});

modal.addEventListener("click",(e)=>{

    if(e.target===modal){

        modal.style.display="none";

    }

});