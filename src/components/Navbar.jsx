import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";

const pages = [
  { name: "HOME", path: "/" },
  { name: "LOST ITEMS", path: "/lost" },
  { name: "FOUND ITEMS", path: "/found" },
  { name: "LOGOUT", path: "/" }
];

export default function Navbar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar position="static" sx={{ background: "#0A1D37" }}>
      {" "}
      {/* Dark Blue */}
      <Toolbar>
        {/* Logo/Title */}
        <Typography
          variant="h6"
          noWrap
          component="a"
          href="/"
          sx={{
            fontFamily: "Roboto, sans-serif",
            mr: 3,
            fontWeight: 700,
            letterSpacing: ".1rem",
            color: "inherit",
            textDecoration: "none"
          }}
        >
          Lost & Found
        </Typography>

        {/* Desktop Links (Centered and Closer) */}
        <Box
          sx={{
            flexGrow: 1, // Takes up remaining space
            display: { xs: "none", md: "flex" },
            // === CHANGE 1: Center the entire group of links ===
            justifyContent: "center" 
          }}
        >
          {pages.map((page) => (
            <Button
              key={page.name}
              component={Link}
              to={page.path}
              sx={{
                my: 2,
                color: "white",
                display: "block",
                fontFamily: "Roboto, sans-serif",
                fontSize: "0.875rem",
                fontWeight: 500,
                // === CHANGE 2: Control spacing with margin ===
                mx: 2, // 'mx: 2' sets margin of 2 units (16px) on the left and right, making them moderately near
                
                "&:hover": {
                  color: "#64b5f6",
                  textDecoration: "underline",
                  textUnderlineOffset: "5px",
                  backgroundColor: "transparent" 
                }
              }}
            >
              {page.name}
            </Button>
          ))}
        </Box>
        
        {/* Mobile Menu Icon */}
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton size="large" color="inherit" onClick={handleOpenNavMenu}>
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorElNav}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
          >
            {pages.map((page) => (
              <MenuItem
                key={page.name}
                component={Link}
                to={page.path}
                onClick={handleCloseNavMenu}
              >
                {page.name}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}