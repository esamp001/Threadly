import { Box, Grid } from '@mui/material'
import { Grid3x3, Home, TrendingUp, Users } from 'lucide-react'

const Header = () => {




	return (
		<Grid container gap={2} sx={{ p: 3, border: '1px solid red', width: '100%', height: 150, alignItems: 'center' }}>
			<Grid sx={{ border: '1px solid', fontWeight: 700 }} item xs={12} sm={4} md={2} lg={2}>
				Threadly
			</Grid>

			{/* Navigation items with icons */}
			<Grid sx={{ border: '1px solid' }} item xs={12} sm={4} md={4} lg={6}>
				<Grid sx={{ border: '1px solid' }} item xs={12} sm={4} md={5} lg={6}>
					<Box sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						width: '100%'
					}}>
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
				</Grid>
			</Grid>

			{/* Avatar - always small */}
			<Grid sx={{ border: '1px solid' }} item xs={12} sm={0} md={2} lg={2}>
				AVATAR
			</Grid>
		</Grid>
	)
}

export default Header