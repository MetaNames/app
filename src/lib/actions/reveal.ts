/**
 * Scroll Reveal Action for Svelte
 * 
 * Usage in Svelte component:
 * <div use:reveal={{ delay: 100, threshold: 0.1 }}>
 *   Content that fades in on scroll
 * </div>
 * 
 * Or with stagger:
 * <div class="stagger-children" use:reveal>
 *   <div>Child 1</div>
 *   <div>Child 2</div>
 *   <div>Child 3</div>
 * </div>
 */

export function reveal(node: HTMLElement, options: { delay?: number; threshold?: number; once?: boolean } = {}) {
  const { delay = 0, threshold = 0.1, once = true } = options;
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    node.style.opacity = '1';
    node.style.transform = 'none';
    return;
  }
  
  // Set initial state
  node.style.opacity = '0';
  node.style.transform = 'translateY(20px)';
  node.style.transition = `opacity 300ms ease-out ${delay}ms, transform 300ms ease-out ${delay}ms`;
  node.classList.add('reveal');
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add small delay for the CSS transition to work
          requestAnimationFrame(() => {
            node.style.opacity = '1';
            node.style.transform = 'translateY(0)';
            node.classList.add('visible');
          });
          
          if (once) {
            observer.unobserve(node);
          }
        } else if (!once) {
          node.style.opacity = '0';
          node.style.transform = 'translateY(20px)';
          node.classList.remove('visible');
        }
      });
    },
    {
      threshold,
      rootMargin: '0px 0px -50px 0px'
    }
  );
  
  observer.observe(node);
  
  return {
    destroy() {
      observer.disconnect();
    }
  };
}

export default reveal;
