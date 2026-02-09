import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material'
import { Home, LayoutTemplate, TrendingUp, Users } from 'lucide-react'
import { useState } from 'react'

const BottomNav = () => {
  const [value, setValue] = useState(0)

  return (
    <Box sx={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      display: { xs: 'block', sm: 'none' }
    }}>
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue)
        }}
        sx={{
          backgroundColor: 'background.paper',
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          height: 60
        }}
      >
        <BottomNavigationAction
          icon={<Home size={24} />}
          sx={{
            minWidth: 'auto',
            px: 1,
            '&.Mui-selected': {
              color: 'primary.main'
            }
          }}
        />
        <BottomNavigationAction
          icon={<TrendingUp size={24} />}
          sx={{
            minWidth: 'auto',
            px: 1,
            '&.Mui-selected': {
              color: 'primary.main'
            }
          }}
        />
        <BottomNavigationAction
          icon={<LayoutTemplate Grid3x3 size={24} />}
          sx={{
            minWidth: 'auto',
            px: 1,
            '&.Mui-selected': {
              color: 'primary.main'
            }
          }}
        />
        <BottomNavigationAction
          icon={<Users size={24} />}
          sx={{
            minWidth: 'auto',
            px: 1,
            '&.Mui-selected': {
              color: 'primary.main'
            }
          }}
        />
      </BottomNavigation>
    </Box>
  )
}

export default BottomNav