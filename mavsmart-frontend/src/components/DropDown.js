const DropdownMenu = ({ userName, handleLogout }) => (
  <div className="z-10 absolute right-0 mt-2 bg-[#d6d6db] divide-y divide-gray-100 rounded-lg shadow-sm w-44 text-center">
    <div className="px-4 py-3 text-sm text-black-900">
      <div>{userName}</div>
    </div>
    <div className="py-1">
      <button
        onClick={handleLogout}
        className="block px-4 py-2 text-sm text-black-900 hover:bg-[#0064b1] hover:text-white w-full text-center"
      >
        Log out
      </button>
    </div>
  </div>
);

export default DropdownMenu;
