import lightLogo from '@/assets/Website/nexa-orbit-logo.svg';
import darkLogo from '@/assets/Website/nexa-dark-transparent.png';

export default function BrandLogo({ className = '', alt = 'NEXA', darkMode, ...props }) {
  // The admin workspace owns its theme independently of the document theme.
  if (typeof darkMode === 'boolean') {
    return <img {...props} src={darkMode ? darkLogo : lightLogo} alt={alt} className={className} />;
  }
  return <>
    <img {...props} src={lightLogo} alt={alt} className={`nexa-logo-light ${className}`} />
    <img {...props} src={darkLogo} alt={alt} className={`nexa-logo-dark ${className}`} />
  </>;
}
