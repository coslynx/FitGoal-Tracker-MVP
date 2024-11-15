import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Drawer, CssBaseline, Box, List, ListItem, ListItemText } from '@material-ui/core';
import { AuthContext } from '@web/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const drawer = (
    <div>
      <List>
          <ListItem button onClick={() => navigate('/')}>
            <ListItemText primary={"Dashboard"} />
          </ListItem>
          <ListItem button onClick={() => navigate('/goals')}>
            <ListItemText primary={"Goals"} />
          </ListItem>
          <ListItem button onClick={() => navigate('/progress')}>
            <ListItemText primary={"Progress"} />
          </ListItem>
          <ListItem button onClick={() => navigate('/social')}>
            <ListItemText primary={"Social Feed"} />
          </ListItem>
          <ListItem button onClick={() => navigate('/profile')}>
            <ListItemText primary={"Profile"} />
          </ListItem>
      </List>
      {currentUser && (
          <List>
              <ListItem button onClick={handleLogout}>
                  <ListItemText primary={"Logout"} />
              </ListItem>
          </List>
      )}
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" style={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            {/* Add menu icon here */}
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Fitness Goal Tracker
          </Typography>
          {currentUser ? (
            <Typography>{currentUser.firstName}</Typography>
          ) : (
            <>
              <Button onClick={() => navigate('/login')}>Login</Button>
              <Button onClick={() => navigate('/signup')}>Signup</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}>
        {/* The implementation of the drawer */}
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
```