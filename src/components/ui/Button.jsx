import { Link } from 'react-router-dom';

export default function Button({ children, href, variant = 'primary', className = '' }) {
  const base = 'inline-block px-6 py-3 rounded-md text-sm font-semibold transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.97] active:duration-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500';

  const variants = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 shadow-sm hover:shadow-md hover:shadow-orange-200/60',
    outline: 'bg-transparent text-white border-2 border-white hover:bg-white hover:text-orange-500',
    navy:    'bg-slate-800 text-white hover:bg-slate-700 active:bg-slate-900 shadow-sm hover:shadow-md',
  };

  const classes = `${base} ${variants[variant] ?? variants.primary} ${className}`;

  if (href) {
    const isExternal = href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:');
    if (isExternal) {
      return <a href={href} className={classes} target="_blank" rel="noopener noreferrer">{children}</a>;
    }
    return <Link to={href} className={classes}>{children}</Link>;
  }

  return <button className={classes}>{children}</button>;
}
