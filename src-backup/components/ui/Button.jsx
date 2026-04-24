export default function Button({ children, href, variant = 'primary', className = '' }) {
  const base = 'inline-block px-6 py-3 rounded-md text-sm font-semibold transition-colors';

  const variants = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600',
    outline: 'bg-transparent text-white border-2 border-white hover:bg-white hover:text-orange-500',
    navy:    'bg-slate-800 text-white hover:bg-slate-900',
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return <a href={href} className={classes}>{children}</a>;
  }

  return <button className={classes}>{children}</button>;
}
