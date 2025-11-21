import Link from 'next/link';
import { useRouter } from 'next/router';

const Header = () => {
  const router = useRouter();

  const isActive = (pathname) => {
    return router.pathname === pathname ? 'active' : '';
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <Link href="/" className="nav-brand">
            AmitojInfra
          </Link>
          <ul className="nav-links">
            <li>
              <Link href="/" className={isActive('/')}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className={isActive('/about')}>
                About
              </Link>
            </li>
            <li>
              <Link href="/services" className={isActive('/services')}>
                Services
              </Link>
            </li>
            <li>
              <Link href="/contact" className={isActive('/contact')}>
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;