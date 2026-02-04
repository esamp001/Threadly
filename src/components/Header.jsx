import { Avatar, Box, InputAdornment, TextField, Typography } from '@mui/material';
import { Home, LayoutTemplate, Search as SearchIcon, TrendingUp, Users } from 'lucide-react';

const Header = () => {




	return (
		<Box sx={{
			display: 'flex',
			alignItems: 'center',
			justifyContent: { xs: 'flex-start', sm: 'center' },  // Left on mobile, center on larger
			p: 3,
			height: { xs: 80, sm: 100, md: 120, lg: 150 },
			gap: 6
		}}>
			<Typography
				variant="h6"
				sx={{
					fontWeight: 700,
					letterSpacing: '0.1rem',
					fontSize: { xs: '1rem', sm: '1rem', md: '0.9rem', lg: '1.1rem' }
				}}
			>
				Threadly
			</Typography>


			<Box sx={{ display: { xs: 'none', sm: 'none', md: 'flex' }, gap: 10, ml: 8, alignItems: 'center', }}>
				<Home size={25} />
				<TrendingUp size={25} />
				<LayoutTemplate size={25} />
				<Users size={25} />
			</Box>


			<Box>
				<Box>
					<TextField
						sx={{
							width: { xs: 200, sm: 270, md: 320, lg: 380 }
						}}
						size='small'
						placeholder="Search"
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon />
								</InputAdornment>
							),
						}}
					/>
				</Box>
			</Box>



			<Box sx={{ display: 'flex', gap: 1, width: 150 }}>
				<Box sx={{ position: 'relative' }}>
					<Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
						<Avatar sx={{ width: 50, height: 50, }}>J</Avatar>
					</Box>

					<Box
						sx={{
							position: 'absolute',
							bottom: -4,
							right: -4,
							bgcolor: 'success.main',
							color: '#fff',
							px: 0.8,
							py: 0.2,
							fontSize: 10,
							borderRadius: '999px',
							fontWeight: 700,
						}}
					>
						Lv 12
					</Box>
				</Box>

				<Box sx={{
					alignItems: 'center',
					flexDirection: 'column',
					gap: 1,
					width: 150,
					display: { xs: 'none', sm: 'none', md: 'none', lg: 'flex' }
				}}>
					<Typography sx={{ fontWeight: 700 }}>John Doe</Typography>
					<Typography
						sx={{
							display: 'inline-block',
							fontSize: 11,
							fontWeight: 700,
							color: 'success.light',
							bgcolor: 'rgba(76, 175, 80, 0.12)',
							px: 1,
							py: 0.2,
							borderRadius: '6px',
							letterSpacing: 0.3,
						}}
					>
						Head Hunter
					</Typography>
				</Box>
			</Box>

		</Box>
	)
}

export default Header