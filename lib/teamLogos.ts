const SUPABASE_URL = 'https://wmuibafrpidgwaidekrj.supabase.co'
const STORAGE_PATH = `${SUPABASE_URL}/storage/v1/object/public/team-logos`

export const TEAM_LOGOS: { [key: string]: string } = {
  'Karachi Kings': `${STORAGE_PATH}/Karachi_Kings.png`,
  'Lahore Qalandars': `${STORAGE_PATH}/Lahore_Qalandars.png`,
  'Islamabad United': `${STORAGE_PATH}/Islamabad_United.png`,
  'Peshawar Zalmi': `${STORAGE_PATH}/Peshawar_Zalmi_logo.png`,
  'Quetta Gladiators': `${STORAGE_PATH}/Quetta_Gladiators.png`,
  'Multan Sultans': `${STORAGE_PATH}/MultanSultans.png`,
}

export const TEAM_COLORS: { [key: string]: string } = {
  'Karachi Kings': '#0066CC',
  'Lahore Qalandars': '#FFD700',
  'Islamabad United': '#DC143C',
  'Peshawar Zalmi': '#FFD700',
  'Quetta Gladiators': '#9B30FF',
  'Multan Sultans': '#FFD700',
}

export function getTeamLogo(teamName: string): string {
  return TEAM_LOGOS[teamName] || TEAM_LOGOS['Karachi Kings']
}

export function getTeamColor(teamName: string): string {
  return TEAM_COLORS[teamName] || '#0066CC'
}

export function getTeamInitials(teamName: string): string {
  return teamName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
