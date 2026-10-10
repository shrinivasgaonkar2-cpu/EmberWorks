const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");

if (menuToggle && navigation) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation menu" : "Close navigation menu");
    navigation.classList.toggle("is-open", !isExpanded);
    document.body.classList.toggle("menu-open", !isExpanded);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

const workPageLinkHandler = (event) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !(event.target instanceof Element)
  ) {
    return;
  }

  const link = event.target.closest("a[href]");
  if (!(link instanceof HTMLAnchorElement) || link.target || link.hasAttribute("download")) return;

  const destination = new URL(link.href, window.location.href);
  const destinationPath = destination.pathname.toLowerCase();
  const isPortfolioDestination = destinationPath.endsWith("/")
    || ["/index.html", "/work.html", "/about.html", "/collaborate.html", "/collaborate-form.html"]
      .some((path) => destinationPath.endsWith(path));
  const currentPath = window.location.pathname.toLowerCase();

  if (!isPortfolioDestination || destinationPath === currentPath) return;

  event.preventDefault();
  document.querySelector("#main-content")?.classList.add("page-exit-left");
  window.setTimeout(() => window.location.assign(destination.href), 400);
};

document.addEventListener("click", workPageLinkHandler);

const collaborationForm = document.querySelector("#collaboration-form");

if (collaborationForm instanceof HTMLFormElement) {
  const formStatus = document.querySelector("#collaboration-form-status");

  collaborationForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!collaborationForm.reportValidity()) return;
    if (!(formStatus instanceof HTMLElement)) {
      throw new Error("Collaboration form status element is missing.");
    }

    formStatus.hidden = false;
    formStatus.classList.remove("is-error");
    formStatus.textContent = "Sending your details...";

    const submitButton = collaborationForm.querySelector('button[type="submit"]');
    if (!(submitButton instanceof HTMLButtonElement)) {
      throw new Error("Collaboration form submit button is missing.");
    }

    submitButton.disabled = true;

    try {
      let response;
      try {
        response = await fetch("/.netlify/functions/collaboration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(new FormData(collaborationForm)))
        });
      } catch {
        throw new Error("Could not connect to the form service. Please try again later.");
      }

      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("The form service returned an invalid response. Please try again later.");
      }

      if (!response.ok) {
        throw new Error(result.message || "Your details could not be sent. Please try again.");
      }

      formStatus.textContent = result.message;
      collaborationForm.reset();
    } catch (error) {
      formStatus.classList.add("is-error");
      formStatus.textContent = error instanceof Error
        ? error.message
        : "Your details could not be sent. Please try again.";
    } finally {
      submitButton.disabled = false;
    }
  });
}

const workProjects = document.querySelector("#work-projects");

if (workProjects && Array.isArray(window.portfolioProjects)) {
  const categoryThemes = {
    "Fire & Smoke": "fire",
    Fluids: "fluid",
    Compositing: "compositing",
    Modeling: "modeling",
    Motion: "motion"
  };

  const imageDialog = document.createElement("dialog");
  imageDialog.className = "work-image-dialog";
  imageDialog.setAttribute("aria-label", "Project image preview");

  const closeImageDialog = document.createElement("button");
  closeImageDialog.className = "work-image-dialog-close";
  closeImageDialog.type = "button";
  closeImageDialog.setAttribute("aria-label", "Close image preview");
  closeImageDialog.textContent = "×";

  const imageFigure = document.createElement("figure");
  const previewImage = document.createElement("img");
  previewImage.className = "work-image-dialog-image";
  const imageCaption = document.createElement("figcaption");
  imageFigure.append(previewImage, imageCaption);
  imageDialog.append(closeImageDialog, imageFigure);
  document.body.append(imageDialog);

  closeImageDialog.addEventListener("click", () => imageDialog.close());
  imageDialog.addEventListener("click", (event) => {
    if (event.target === imageDialog) imageDialog.close();
  });

  window.portfolioProjects
    .forEach((project, index) => {
      const card = document.createElement("article");
      card.className = "project-card work-project-card";
      card.dataset.category = project.category;

      const previewButton = document.createElement("button");
      previewButton.className = "project-card-link";
      previewButton.type = "button";
      previewButton.setAttribute("aria-label", `View ${project.title} image`);
      previewButton.addEventListener("click", () => {
        if (!project.thumbnail) return;

        previewImage.src = project.thumbnail;
        previewImage.alt = `${project.title} — ${project.category}`;
        imageCaption.textContent = project.title;
        imageDialog.showModal();
      });

      const visual = document.createElement("span");
      visual.className = `project-visual theme-${categoryThemes[project.category] || "default"}`;
      visual.setAttribute("aria-hidden", "true");

      const artwork = document.createElement("span");
      artwork.className = "visual-art";
      artwork.innerHTML = '<span class="art-halo"></span><span class="art-orbit"></span><span class="art-orb"></span><span class="art-satellite"></span>';
      visual.append(artwork);

      if (project.thumbnail) {
        const image = document.createElement("img");
        image.src = project.thumbnail;
        image.alt = "";
        image.loading = "lazy";
        visual.append(image);
      } else {
        const placeholder = document.createElement("span");
        placeholder.className = "visual-placeholder";
        placeholder.textContent = "PREVIEW PLACEHOLDER";
        visual.append(placeholder);
      }

      const indexLabel = document.createElement("span");
      indexLabel.className = "project-index";
      indexLabel.textContent = String(index + 1).padStart(2, "0");
      visual.append(indexLabel);

      const meta = document.createElement("span");
      meta.className = "project-meta";

      const text = document.createElement("span");
      text.className = "project-copy";
      const category = document.createElement("span");
      category.className = "project-category";
      category.textContent = project.category;
      const title = document.createElement("span");
      title.className = "project-title";
      title.setAttribute("role", "heading");
      title.setAttribute("aria-level", "3");
      title.textContent = project.title;
      const summary = document.createElement("span");
      summary.className = "project-summary";
      summary.textContent = project.summary;
      text.append(category, title, summary);

      const arrow = document.createElement("span");
      arrow.className = "project-arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "＋";
      meta.append(text, arrow);

      const downloadLink = document.createElement("a");
      downloadLink.className = "work-download-link";
      downloadLink.href = "collaborate.html";
      downloadLink.setAttribute("aria-label", `Ask about downloading ${project.title} blend files on the Collaborate page`);
      downloadLink.innerHTML = 'Download .blend <span aria-hidden="true">↗</span>';

      previewButton.append(visual, meta);
      card.append(previewButton, downloadLink);
      workProjects.append(card);
    });

  const workFilters = document.querySelectorAll(".work-filter");
  workFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const selectedCategory = filter.dataset.filter;
      if (!selectedCategory) return;

      workFilters.forEach((button) => {
        const isActive = button === filter;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });

      workProjects.querySelectorAll(".work-project-card").forEach((card) => {
        card.hidden = selectedCategory !== "All" && card.dataset.category !== selectedCategory;
      });
    });
  });
}

const revealTargets = document.querySelectorAll(".section-heading, .project-card, .intro-section");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion && revealTargets.length > 0) {
  document.body.classList.add("scroll-reveal-enabled");

  revealTargets.forEach((target, index) => {
    if (target.classList.contains("project-card")) {
      target.style.setProperty("--reveal-delay", `${(index % 4) * 90}ms`);
    }
  });

  const revealVisibleTargets = () => {
    revealTargets.forEach((target) => {
      if (target.classList.contains("is-revealed")) return;

      const bounds = target.getBoundingClientRect();
      if (bounds.top < window.innerHeight * 0.92 && bounds.bottom > window.innerHeight * 0.08) {
        target.classList.add("is-revealed");
      }
    });
  };

  revealVisibleTargets();

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    revealTargets.forEach((target) => revealObserver.observe(target));
  } else {
    window.addEventListener("scroll", revealVisibleTargets, { passive: true });
    window.addEventListener("resize", revealVisibleTargets);
  }
}

const heroVideo = document.querySelector(".hero-video");

if (heroVideo instanceof HTMLVideoElement) {
  const loadHeroVideo = () => {
    const videoSource = heroVideo.dataset.videoSrc;
    if (!videoSource || heroVideo.src) return;

    heroVideo.src = videoSource;
    heroVideo.load();
    heroVideo.play().then(() => {
      heroVideo.classList.add("is-playing");
    }).catch(() => {
      heroVideo.closest(".home-hero")?.classList.add("showreel-unavailable");
    });
  };

  heroVideo.addEventListener("error", () => {
    heroVideo.closest(".home-hero")?.classList.add("showreel-unavailable");
  }, { once: true });

  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries, observer) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadHeroVideo();
        observer.disconnect();
      }
    }, { rootMargin: "200px" });

    videoObserver.observe(heroVideo);
  } else {
    loadHeroVideo();
  }
}
