const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const navList = document.querySelector(".nav-list");
const navLinks = document.querySelectorAll(".nav-list a");
const menuClose = document.querySelector(".menu-close");
const menuOverlay = document.querySelector(".menu-overlay");
const currentDateElements = document.querySelectorAll(".current-date");
const showMoreButton = document.querySelector(".show-more-btn");
const contactForm = document.querySelector(".contact-form");
const paymentSummaryText = document.querySelector(".payment-summary-text");
const calculatedPaymentInput = document.querySelector(".calculated-payment-input");
const stripePaymentLink = document.querySelector(".stripe-payment-link");

let pageFontSize = Number(localStorage.getItem("pageFontSize")) || 100;
let menuCloseTimer;

const applyFontSize = () => {
  document.documentElement.style.fontSize = `${pageFontSize}%`;
  localStorage.setItem("pageFontSize", String(pageFontSize));
};

applyFontSize();

if (menuToggle && mainNav && navList && menuOverlay) {
  const menuToggleLabel = menuToggle.querySelector(".menu-toggle-label");

  const setMenuState = (isOpen) => {
    window.clearTimeout(menuCloseTimer);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");

    if (menuToggleLabel) {
      menuToggleLabel.textContent = isOpen ? "Close" : "Menu";
    }

    if (isOpen) {
      menuOverlay.hidden = false;
      requestAnimationFrame(() => {
        mainNav.classList.add("is-open");
        navList.classList.add("is-open");
        menuOverlay.classList.add("is-open");
        document.body.classList.add("nav-open");
      });
      return;
    }

    mainNav.classList.remove("is-open");
    navList.classList.remove("is-open");
    menuOverlay.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    menuCloseTimer = window.setTimeout(() => {
      menuOverlay.hidden = true;
    }, 300);
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = !mainNav.classList.contains("is-open");
    setMenuState(isOpen);
  });

  if (menuClose) {
    menuClose.addEventListener("click", () => setMenuState(false));
  }

  menuOverlay.addEventListener("click", () => setMenuState(false));

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mainNav.classList.contains("is-open")) {
      setMenuState(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1100 && mainNav.classList.contains("is-open")) {
      setMenuState(false);
    }
  });
}

navLinks.forEach((link) => {
  link.addEventListener("mouseenter", () => {
    link.classList.add("js-nav-hover");
  });

  link.addEventListener("mouseleave", () => {
    link.classList.remove("js-nav-hover");
  });
});

currentDateElements.forEach((element) => {
  const today = new Date();
  element.textContent = `Updated: ${today.getFullYear()}`;
});

if (showMoreButton) {
  const panelId = showMoreButton.getAttribute("aria-controls");
  const morePanel = panelId ? document.getElementById(panelId) : null;

  showMoreButton.addEventListener("click", () => {
    if (!morePanel) {
      return;
    }

    const isOpen = morePanel.hasAttribute("hidden");
    morePanel.toggleAttribute("hidden", !isOpen);
    showMoreButton.setAttribute("aria-expanded", String(isOpen));
    showMoreButton.textContent = isOpen ? "Show Less" : "Show More";
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    pageFontSize = Math.min(pageFontSize + 5, 120);
    applyFontSize();
  }

  if (event.key === "ArrowDown") {
    pageFontSize = Math.max(pageFontSize - 5, 90);
    applyFontSize();
  }
});

const setFieldError = (field, message) => {
  const fieldWrapper = field.closest(".form-field");
  const errorMessage = fieldWrapper ? fieldWrapper.querySelector(".error-message") : null;

  field.classList.toggle("field-error", Boolean(message));

  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.classList.toggle("is-visible", Boolean(message));
  }
};

const getFormValue = (formData, fieldName) => {
  return String(formData.get(fieldName) || "").trim();
};

const monthlyLessonFees = {
  "30-minutes": 180,
  "45-minutes": 270,
  "60-minutes": 360,
};

const stripePaymentLinks = {
  "30-minutes": "https://buy.stripe.com/dRm14n2jM3eX4ER0OgdIA00",
  "45-minutes": "https://buy.stripe.com/14A3cv3nQaHpdbndB2dIA01",
  "60-minutes": "https://buy.stripe.com/aFabJ1gac9D12wJdCwYdIA02",
};

const serviceLengthMultipliers = {
  "one-month": 1,
  "three-months": 3,
  "fall-semester-four-months": 4,
  "spring-semester-six-months": 6,
  "summer-two-months": 2,
  "one-year": 12,
};

const calculatePayment = (formData) => {
  const lessonDuration = getFormValue(formData, "lessonDuration");
  const serviceLength = getFormValue(formData, "serviceLength");

  if (!lessonDuration || !serviceLength) {
    return {
      amount: null,
      text: "Choose a lesson duration and service length to calculate the payment amount.",
    };
  }

  const isTrialDuration = lessonDuration === "15-minute-free-trial";
  const isTrialServiceLength = serviceLength === "trial-lesson";

  if (isTrialDuration !== isTrialServiceLength) {
    return {
      amount: null,
      text: "For a free trial, choose both the 15-minute free trial duration and Trial lesson service length.",
    };
  }

  if (isTrialDuration && isTrialServiceLength) {
    return {
      amount: 0,
      text: "Amount due: $0 for the free 15-minute trial lesson.",
    };
  }

  const monthlyFee = monthlyLessonFees[lessonDuration];
  const months = serviceLengthMultipliers[serviceLength];

  if (!monthlyFee || !months) {
    return {
      amount: null,
      text: "Choose a paid lesson duration and service length to calculate the payment amount.",
    };
  }

  const amount = monthlyFee * months;
  const suffix = `${months} month${months === 1 ? "" : "s"}`;

  return {
    amount,
    text: `Amount due: $${amount} (${suffix}, based on $${monthlyFee}/month).`,
  };
};

const updatePaymentSummary = () => {
  if (!contactForm || !paymentSummaryText || !calculatedPaymentInput) {
    return;
  }

  const formData = new FormData(contactForm);
  const payment = calculatePayment(formData);
  const lessonDuration = getFormValue(formData, "lessonDuration");
  const paymentMethod = getFormValue(formData, "paymentMethod");
  const stripeUrl = stripePaymentLinks[lessonDuration] || "";

  paymentSummaryText.textContent = payment.text;
  calculatedPaymentInput.value = payment.amount === null ? "" : `$${payment.amount}`;

  if (stripePaymentLink) {
    const shouldShowStripeLink = payment.amount > 0 && paymentMethod === "credit-card" && Boolean(stripeUrl);
    stripePaymentLink.hidden = !shouldShowStripeLink;
    stripePaymentLink.href = shouldShowStripeLink ? stripeUrl : "#";
  }
};

const validateContactForm = (formData) => {
  const errors = {};
  const studentName = getFormValue(formData, "studentName");
  const guardianName = getFormValue(formData, "guardianName");
  const email = getFormValue(formData, "email");
  const phone = getFormValue(formData, "phone");
  const age = Number(getFormValue(formData, "age"));
  const lesson = getFormValue(formData, "lesson");
  const experience = getFormValue(formData, "experience");
  const lessonDuration = getFormValue(formData, "lessonDuration");
  const serviceLength = getFormValue(formData, "serviceLength");
  const paymentMethod = getFormValue(formData, "paymentMethod");
  const paymentConfirmed = formData.get("paymentConfirmed");
  const message = getFormValue(formData, "message");
  const payment = calculatePayment(formData);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (studentName.length < 3) {
    errors.studentName = "Student name must contain at least 3 characters.";
  }

  if (guardianName.length < 3) {
    errors.guardianName = "Parent or guardian name must contain at least 3 characters.";
  }

  if (!emailPattern.test(email)) {
    errors.email = "Email must include @ and a domain.";
  }

  if (phone.length < 7) {
    errors.phone = "Please enter a phone number.";
  }

  if (!age || age < 3 || age > 100) {
    errors.age = "Please enter the student's age.";
  }

  if (!lesson) {
    errors.lesson = "Please choose a lesson type.";
  }

  if (!experience) {
    errors.experience = "Please choose an experience level.";
  }

  if (!lessonDuration) {
    errors.lessonDuration = "Please choose a lesson duration.";
  }

  if (!serviceLength) {
    errors.serviceLength = "Please choose the requested service length.";
  }

  if (!paymentMethod) {
    errors.paymentMethod = "Please choose a payment method.";
  }

  if (payment.amount === 0 && paymentMethod && paymentMethod !== "free") {
    errors.paymentMethod = "Please choose Free trial lesson for a free trial registration.";
  }

  if (payment.amount && paymentMethod === "free") {
    errors.paymentMethod = "Please choose a paid payment method for paid registration.";
  }

  if (!paymentConfirmed) {
    errors.paymentConfirmed = "Please confirm the payment requirement.";
  }

  if (lessonDuration && serviceLength && payment.amount === null) {
    errors.lessonDuration = "Please choose a valid paid lesson duration or the free trial.";
    errors.serviceLength = "Please choose a valid service length.";
  }

  if (message.length < 10) {
    errors.message = "Goals or notes must contain at least 10 characters.";
  }

  return errors;
};

if (contactForm) {
  updatePaymentSummary();

  contactForm.querySelectorAll("select, input").forEach((field) => {
    field.addEventListener("change", updatePaymentSummary);
  });

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const payment = calculatePayment(formData);
    const calculatedPayment = payment.amount === null ? "" : `$${payment.amount}`;
    calculatedPaymentInput.value = calculatedPayment;
    formData.set("calculatedPayment", calculatedPayment);

    const errors = validateContactForm(formData);
    const status = contactForm.querySelector(".form-status");
    const fields = contactForm.querySelectorAll("input, select, textarea");

    fields.forEach((field) => {
      setFieldError(field, errors[field.name] || "");
    });

    if (Object.keys(errors).length > 0) {
      if (status) {
        status.textContent = "Please correct the highlighted fields.";
        status.className = "form-status is-error";
      }
      return;
    }

    if (status) {
      status.textContent = "Sending registration...";
      status.className = "form-status";
    }

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Form submission failed.");
      }

      contactForm.reset();
      updatePaymentSummary();

      if (status) {
        status.textContent = "Registration sent successfully. Thank you!";
        status.className = "form-status is-success";
      }
    } catch (error) {
      if (status) {
        status.textContent = "Sorry, the registration could not be sent. Please try again.";
        status.className = "form-status is-error";
      }
    }
  });
}

const aboutActionLinks = document.querySelectorAll(".about-action-link");

if (aboutActionLinks.length > 0) {
  aboutActionLinks.forEach((link) => {
    link.addEventListener("click", () => {
      link.classList.add("is-clicked");
    });
  });
}
