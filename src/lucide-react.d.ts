/**
 * Type declarations for lucide-react ESM icon imports
 * Suppresses TS7016 errors for icon-specific imports
 */

declare module 'lucide-react/dist/esm/icons/*' {
  import { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react'
  
  export interface LucideIcon extends ForwardRefExoticComponent<
    Omit<SVGProps<SVGSVGElement>, 'ref'> & RefAttributes<SVGSVGElement>
  > {}
  
  const Icon: LucideIcon
  export default Icon
}
