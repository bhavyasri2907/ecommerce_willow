import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

/** variant: primary | secondary | ghost | danger · size: sm | md */
const Button = forwardRef(function Button(
  { variant = 'secondary', size = 'md', icon: Icon, iconRight: IconRight, loading = false, className = '', children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`btn btn--${variant} btn--${size} ${!children ? 'btn--icon' : ''} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 size={16} className="spin" aria-hidden /> : Icon && <Icon size={16} aria-hidden />}
      {children}
      {IconRight && <IconRight size={16} aria-hidden />}
    </button>
  );
});

export default Button;
