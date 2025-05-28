const Footer = () => {
  return (
    <footer className="w-full bg-gray-100 border-t border-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
        <p>© {new Date().getFullYear()} Leave Management System. All rights reserved.</p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
          <a href="/terms" className="hover:underline">Terms of Service</a>
          <a href="/contact" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
