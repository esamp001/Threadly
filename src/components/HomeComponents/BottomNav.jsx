import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material'
import { Bell, Home, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const BottomNav = ({ openDrawer, setOpenDrawer }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [value, setValue] = useState(0)
  const [visible, setVisible] = useState(true)
  const [prevScrollPos, setPrevScrollPos] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY

      // 1. Show if scrolling up, hide if scrolling down
      // 2. Always show if we are at the very top of the page
      const isVisible = prevScrollPos > currentScrollPos || currentScrollPos < 10

      setVisible(isVisible)
      setPrevScrollPos(currentScrollPos)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [prevScrollPos])

  return (
    <Box sx={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      display: { xs: 'block', sm: 'none' },
      backgroundColor: 'background.default',
      borderTop: '1px solid',
      borderColor: 'divider',
      pb: 'env(safe-area-inset-bottom)',

      // --- ANIMATION LOGIC ---
      transition: 'transform 0.3s ease-in-out', // Smooth sliding
      transform: visible ? 'translateY(0)' : 'translateY(100%)', // Slide down to hide
    }}>
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
        sx={{ height: 60, backgroundColor: 'transparent' }}
      >
        <BottomNavigationAction
          icon={<Home size={24} />}
          sx={{ minWidth: 'auto' }}
          onClick={() => {
            if (location.pathname === '/home') {
              window.location.reload();
            } else {
              navigate('/home');
            }
          }}
        />
        <BottomNavigationAction
          icon={
            <Box
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                borderRadius: '50%',
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                transform: 'translateY(-8px)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-12px)',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                },
              }}
            >
              <MessageCircle size={28} />
            </Box>
          }
          sx={{ minWidth: 'auto' }}
          onClick={() => navigate('/messages')}
        />
        <BottomNavigationAction
          icon={<Bell size={24} />}
          sx={{ minWidth: 'auto' }}
          onClick={() => navigate('/notifications')}
        />
      </BottomNavigation>
    </Box>
  )
}

export default BottomNav