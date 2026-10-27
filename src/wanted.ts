import type { CrewRole, FruitType, WantedStatus } from './types'

export const wantedStatusLabels: Record<WantedStatus, string> = {
  AT_LARGE: 'En libertad',
  CAPTURED: 'Capturado',
  MISSING: 'Desaparecido',
}

export const wantedStatusTones: Record<WantedStatus, 'danger' | 'success' | 'warning'> = {
  AT_LARGE: 'danger',
  CAPTURED: 'success',
  MISSING: 'warning',
}

export const fruitLabels: Record<FruitType | 'NONE', string> = {
  PARAMECIA: 'Paramecia',
  ZOAN: 'Zoan',
  LOGIA: 'Logia',
  NONE: 'Sin fruta',
}

export const roleLabels: Record<CrewRole, string> = {
  CAPTAIN: 'Capitán',
  FIRST_MATE: 'Primer oficial',
  NAVIGATOR: 'Navegante',
  SNIPER: 'Francotirador',
  COOK: 'Cocinero',
  DOCTOR: 'Médico',
  SHIPWRIGHT: 'Carpintero naval',
  MUSICIAN: 'Músico',
  ARCHAEOLOGIST: 'Arqueólogo',
  HELMSMAN: 'Timonel',
  FIGHTER: 'Combatiente',
}
