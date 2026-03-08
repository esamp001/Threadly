import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material'
import { DiamondPlus, Home, LayoutTemplate, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

const BottomNav = ({ openDrawer, setOpenDrawer }) => {
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
        <BottomNavigationAction icon={<Home size={24} />} sx={{ minWidth: 'auto' }} />
        <BottomNavigationAction icon={<TrendingUp size={24} />} sx={{ minWidth: 'auto' }} />
        <BottomNavigationAction icon={<LayoutTemplate size={24} />} sx={{ minWidth: 'auto' }} />
        <BottomNavigationAction
          icon={<DiamondPlus size={24} />}
          sx={{ minWidth: 'auto' }}
          onClick={() => setOpenDrawer(true)} // Make it clickable!
        />
      </BottomNavigation>
    </Box>
  )
}

export default BottomNav