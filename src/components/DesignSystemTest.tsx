/**
 * Design System Test Component
 * Visual verification of Tailwind design tokens
 */

interface DesignSystemTestProps {
  className?: string
}

export function DesignSystemTest({ className = '' }: DesignSystemTestProps) {
  return (
    <div className={`p-8 space-y-8 ${className}`}>
      {/* Color Palette */}
      <section>
        <h2 className="font-display text-2xl font-bold mb-4">
          Bali-Inspired Color Palette
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-20 bg-primary rounded-card flex items-center justify-center">
              <span className="text-primary-foreground font-sans text-sm">
                Primary
              </span>
            </div>
            <p className="font-sans text-xs text-foreground-secondary">
              Deep Teal
            </p>
          </div>

          <div className="space-y-2">
            <div className="h-20 bg-coral rounded-card flex items-center justify-center">
              <span className="text-coral-foreground font-sans text-sm">
                Coral
              </span>
            </div>
            <p className="font-sans text-xs text-foreground-secondary">
              Warm Coral (Secondary)
            </p>
          </div>

          <div className="space-y-2">
            <div className="h-20 bg-sand rounded-card flex items-center justify-center">
              <span className="text-sand-foreground font-sans text-sm">
                Sand
              </span>
            </div>
            <p className="font-sans text-xs text-foreground-secondary">
              Golden Sand (Secondary)
            </p>
          </div>

          <div className="space-y-2">
            <div className="h-20 bg-success rounded-card flex items-center justify-center">
              <span className="text-success-foreground font-sans text-sm">
                Success
              </span>
            </div>
            <p className="font-sans text-xs text-foreground-secondary">
              Soft Green
            </p>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="font-display text-2xl font-bold mb-4">Typography</h2>
        <div className="space-y-3">
          <p className="font-display text-4xl font-bold">
            Plus Jakarta Sans Display
          </p>
          <p className="font-display text-2xl font-semibold">
            Section Title (SemiBold)
          </p>
          <p className="font-sans text-base">
            Inter body text provides exceptional readability for longer content
            and descriptions.
          </p>
          <p className="font-sans text-sm text-foreground-secondary">
            Caption and meta information (Medium 14px)
          </p>
        </div>
      </section>

      {/* Border Radius */}
      <section>
        <h2 className="font-display text-2xl font-bold mb-4">Border Radius</h2>
        <div className="flex flex-wrap gap-4">
          <div className="bg-primary text-primary-foreground px-6 py-3 rounded-card">
            Card (12px)
          </div>
          <div className="bg-coral text-coral-foreground px-6 py-3 rounded-button">
            Button (8px)
          </div>
          <div className="bg-sand text-sand-foreground px-6 py-3 rounded-pill">
            Pill (24px)
          </div>
        </div>
      </section>

      {/* Spacing */}
      <section>
        <h2 className="font-display text-2xl font-bold mb-4">
          Spacing (4px base unit)
        </h2>
        <div className="space-y-2">
          <div className="bg-neutral-3 h-4 w-4">1 (4px)</div>
          <div className="bg-neutral-3 h-8 w-8">2 (8px)</div>
          <div className="bg-neutral-3 h-12 w-12">3 (12px)</div>
          <div className="bg-neutral-3 h-16 w-16">4 (16px)</div>
        </div>
      </section>

      {/* Breakpoints */}
      <section>
        <h2 className="font-display text-2xl font-bold mb-4">
          Responsive Breakpoints
        </h2>
        <div className="font-sans space-y-2">
          <p className="sm:hidden">Default (mobile-first)</p>
          <p className="hidden sm:block md:hidden">SM: 640px+</p>
          <p className="hidden md:block lg:hidden">MD: 768px+</p>
          <p className="hidden lg:block">LG: 1024px+</p>
        </div>
      </section>
    </div>
  )
}
