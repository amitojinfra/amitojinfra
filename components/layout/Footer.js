const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} AmitojInfra. All rights reserved.</p>
        <p>Built with Next.js and deployed on GitHub Pages</p>
      </div>
    </footer>
  );
};

export default Footer;