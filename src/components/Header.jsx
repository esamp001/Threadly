import { Box } from '@mui/material'
import { Grid3x3, Home, TrendingUp, Users } from 'lucide-react'

const Header = () => {




	return (
		<Box sx={{ display: 'flex', alignItems: 'center', p: 3, border: '1px solid red', height: 150, gap : 2 }}>
			<Box sx={{ border: '1px solid', fontWeight: 700 }}>
				Threadly
			</Box>

			{/* Navigation items with icons */}
			<Box sx={{ border: '1px solid', flexGrow: 1 }}>
				<Box sx={{ border: '1px solid', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
					{/* Left side - Navigation icons */}
					<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
						<Home size={20} />
						<TrendingUp size={20} />
						<Grid3x3 size={20} />
						<Users size={20} />
					</Box>

					{/* Right side - Search bar */}
					<Box>
						SEARCH BAR
					</Box>
				</Box>
			</Box>

			{/* Avatar - always small */}
			<Box sx={{ border: '1px solid' }}>
				AVATAR
			</Box>
		</Box>
	)
}

export default Header