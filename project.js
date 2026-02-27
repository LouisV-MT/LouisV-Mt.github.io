let projectsData = [];

async function loadProjects() {
    try {
        const response = await fetch('projects.json');
        projectsData = await response.json();
        // Sort by ID descending (newest projects first)
        projectsData.sort((a, b) => b.id - a.id);

        renderProjectCarousel();
        setupCarouselScroll();
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function renderProjectCarousel() {
    const carousel = document.getElementById('project-carousel');
    if (!carousel) return;

    carousel.innerHTML = '';

    projectsData.forEach(project => {
        const card = document.createElement('div');

        // APPLIED FIXES: 'shrink-0' prevents squishing.
        // 'w-[85vw] md:w-96' gives it great width on mobile and desktop.
        // 'min-h-[420px]' gives it better vertical breathing room.
        card.className = 'w-[85vw] md:w-96 shrink-0 snap-center bg-white rounded-lg border border-gray-200 shadow-md transform hover:scale-105 transition-transform duration-300 flex flex-col min-h-[420px]';

        card.innerHTML = `
      <img class="rounded-t-lg h-52 w-full object-cover border-b border-gray-100" src="${project.image}" alt="${project.title}" />
      <div class="p-6 flex flex-col flex-grow">
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-dark-slate">${project.title}</h5>
        <p class="project-description mb-4 font-normal text-mid-slate leading-relaxed">${project.cardDescription}</p>
        <div class="mt-auto">
            <button data-project="${project.id}" class="view-details-btn inline-flex items-center px-4 py-2.5 text-sm font-semibold text-center text-white bg-dark-slate rounded-lg hover:bg-mid-slate focus:ring-4 focus:outline-none focus:ring-blue-300 transition-colors">
                View Details
                <svg class="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                </svg>
            </button>
        </div>
      </div>
    `;
        carousel.appendChild(card);
    });

    // Attach event listeners to all 'View Details' buttons
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const projectId = parseInt(e.currentTarget.getAttribute('data-project'));
            openProjectModal(projectId);
        });
    });
}

function setupCarouselScroll() {
    const carousel = document.getElementById('project-carousel');
    const btnLeft = document.getElementById('scroll-left');
    const btnRight = document.getElementById('scroll-right');

    if (!carousel || !btnLeft || !btnRight) return;

    // Dynamically calculate scroll amount based on the actual rendered card size
    const getScrollAmount = () => {
        const firstCard = carousel.firstElementChild;
        if (!firstCard) return 400; // Safe fallback
        // offsetWidth gets the card width, + 32 accounts for Tailwind's gap-8 (2rem)
        return firstCard.offsetWidth + 32;
    };

    btnLeft.addEventListener('click', () => {
        carousel.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });

    btnRight.addEventListener('click', () => {
        carousel.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });

    // Update button states (disable if at the beginning/end)
    const updateButtons = () => {
        btnLeft.disabled = carousel.scrollLeft <= 0;
        // Math.ceil handles sub-pixel rendering bugs in some browsers
        btnRight.disabled = Math.ceil(carousel.scrollLeft + carousel.clientWidth) >= carousel.scrollWidth - 1;

        // Visual updates for disabled state
        btnLeft.style.opacity = btnLeft.disabled ? '0.3' : '1';
        btnLeft.style.cursor = btnLeft.disabled ? 'default' : 'pointer';
        btnRight.style.opacity = btnRight.disabled ? '0.3' : '1';
        btnRight.style.cursor = btnRight.disabled ? 'default' : 'pointer';
    };

    carousel.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', updateButtons);

    // Initial state check
    setTimeout(updateButtons, 100);
}

function openProjectModal(projectId) {
    const project = projectsData.find(p => p.id === projectId);
    if (!project) return;

    const modalContainer = document.getElementById('project-modal');
    if (!modalContainer) return;

    // 1. Generate Tech Badges
    let techHTML = '';
    if (project.tech && project.tech.length > 0) {
        techHTML = project.tech.map(tech =>
            `<span class="bg-gray-200 text-dark-slate text-xs font-semibold px-2.5 py-1 rounded mr-2 mb-2 inline-block shadow-sm">${tech}</span>`
        ).join('');
    }

    // 2. Generate Links
    let buttonsHTML = '';
    if (project.githubLinks && project.githubLinks.length > 0) {
        buttonsHTML += project.githubLinks.map(link =>
            `<a href="${link.url}" target="_blank" class="flex items-center justify-center w-full bg-dark-slate text-white px-4 py-2.5 rounded-lg hover:bg-mid-slate transition shadow-sm mb-3">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path></svg>
                ${link.label}
            </a>`
        ).join('');
    }
    if (project.liveDemo) buttonsHTML += `<a href="${project.liveDemo}" target="_blank" class="flex items-center justify-center w-full bg-beige text-dark-slate font-bold px-4 py-2.5 rounded-lg hover:opacity-80 transition shadow-sm mb-3">Live Demo &rarr;</a>`;
    if (project.pdfLink) buttonsHTML += `<a href="${project.pdfLink}" target="_blank" class="flex items-center justify-center w-full border-2 border-dark-slate text-dark-slate font-bold px-4 py-2.5 rounded-lg hover:bg-gray-50 transition shadow-sm mb-3">View Specs</a>`;

    // 3. Optional Credentials
    let credentialsHTML = '';
    if (project.credentials) {
        credentialsHTML = `
            <div class="bg-off-white p-4 rounded-lg mb-4 text-sm border border-gray-200 shadow-inner">
                <p class="font-bold text-dark-slate mb-2">Demo Credentials:</p>
                <div class="space-y-1">
                    <p><span class="font-semibold text-mid-slate">Email:</span> <br/><span class="font-mono text-xs break-all">${project.credentials.email}</span></p>
                    <p><span class="font-semibold text-mid-slate">Password:</span> <br/><span class="font-mono text-xs break-all">${project.credentials.password}</span></p>
                </div>
            </div>
        `;
    }

    // 4. Generate Key Features
    let featuresHTML = '';
    if (project.keyFeatures && project.keyFeatures.length > 0) {
        featuresHTML = '<ul class="list-disc pl-5 text-mid-slate space-y-2 text-lg leading-relaxed">';
        project.keyFeatures.forEach(feature => {
            featuresHTML += `<li>${feature}</li>`;
        });
        featuresHTML += '</ul>';
    }

    // 5. Inject the NEW Grid layout into the modal container
    modalContainer.innerHTML = `
    <div class="bg-white w-full max-w-5xl rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden" onclick="event.stopPropagation()">
      
      <button class="absolute top-4 right-4 text-dark-slate bg-white/90 hover:bg-gray-100 z-10 p-2.5 rounded-full backdrop-blur transition-all shadow-md" onclick="closeProjectModal()">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      <div class="flex-1 overflow-y-auto scroll-smooth w-full p-6 md:p-10">
        
        <h3 class="text-3xl md:text-5xl font-bold text-dark-slate mb-6 text-center font-serif">${project.title}</h3>
        <div class="mb-12 w-full">
            <img src="${project.image}" alt="Screenshot of ${project.title}" class="rounded-xl shadow-md w-full max-h-[500px] object-cover border border-gray-200">
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-16">
          <div class="lg:col-span-2 flex flex-col space-y-12">
            <div>
              <h4 class="font-bold text-2xl text-dark-slate mb-4 border-b-2 border-gray-100 pb-2">Overview</h4>
              <p class="text-lg text-mid-slate leading-relaxed">${project.fullDescription}</p>
            </div>
            <div>
              <h4 class="font-bold text-2xl text-dark-slate mb-4 border-b-2 border-gray-100 pb-2">Key Features</h4>
              ${featuresHTML}
            </div>
          </div>
          <div class="lg:col-span-1 flex flex-col space-y-12">
            <div>
              <h4 class="font-bold text-2xl text-dark-slate mb-4 border-b-2 border-gray-100 pb-2">Tech Stack</h4>
              <div class="flex flex-wrap">
                  ${techHTML}
              </div>
            </div>
            <div>
              <h4 class="font-bold text-2xl text-dark-slate mb-4 border-b-2 border-gray-100 pb-2">Project Links</h4>
              ${credentialsHTML}
              <div class="flex flex-col w-full">
                  ${buttonsHTML}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;

    modalContainer.classList.remove('hidden');
    modalContainer.classList.add('flex');
    modalContainer.classList.remove('opacity-0');
    modalContainer.classList.add('opacity-100');

    // THE FIX: Lock the specific scrolling container instead of the body
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.style.overflow = 'hidden';
}

function closeProjectModal() {
    const modalContainer = document.getElementById('project-modal');
    if (modalContainer) {
        modalContainer.classList.add('opacity-0');
        modalContainer.classList.remove('opacity-100');

        setTimeout(() => {
            modalContainer.classList.add('hidden');
            modalContainer.classList.remove('flex');

            // THE FIX: Unlock the scrolling container
            const mainContent = document.getElementById('main-content');
            if (mainContent) mainContent.style.overflow = '';
        }, 300);
    }
}

// Close modal when clicking on the dark background
document.getElementById('project-modal')?.addEventListener('click', closeProjectModal);

document.addEventListener('DOMContentLoaded', loadProjects);