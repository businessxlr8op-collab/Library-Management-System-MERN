import React, { useCallback } from "react";

const Navbar = React.memo(function Navbar({ onSearchBooks }) {

  return (
    <nav className="navbar bg-base-100">
      {/* ...other navbar content... */}
      {/* SearchBar removed as per requirements */}
      {/* ...other navbar content... */}
    </nav>
  );
});

export default Navbar;
