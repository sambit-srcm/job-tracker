import {
  Briefcase,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Wifi,
  Building2,
  MapPin,
} from 'lucide-react'

// Base URL for the json-server mock API
export const API_BASE_URL = 'http://localhost:3001'

// Color and animation config keyed by application status
export const STATUS_CONFIG = {
  Applied: {
    dot: 'bg-indigo-400',
    pill: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  Interviewing: {
    dot: 'bg-amber-400 animate-pulse',
    pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  Hired: {
    dot: 'bg-emerald-400',
    pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  Rejected: {
    dot: 'bg-rose-400',
    pill: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
}

// Ordered list of all valid status values derived from STATUS_CONFIG keys
export const STATUSES = Object.keys(STATUS_CONFIG)

// Display metadata for each status stat tile
export const STATS = [
  {
    key: 'Applied',
    label: 'Applied',
    icon: Briefcase,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    key: 'Interviewing',
    label: 'Interviewing',
    icon: MessageSquare,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    key: 'Hired',
    label: 'Hired',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    key: 'Rejected',
    label: 'Rejected',
    icon: XCircle,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
]

// Valid work arrangement options for the form dropdown
export const WORK_TYPES = ['Remote', 'Hybrid', 'Onsite']

// Icon elements mapped to each work type for the table location column
export const WORK_ICON = {
  Remote: <Wifi className="h-3 w-3" />,
  Hybrid: <Building2 className="h-3 w-3" />,
  Onsite: <MapPin className="h-3 w-3" />,
}

// Blank form state used when creating a new application; date defaults to today
export const EMPTY_FORM = {
  company: '',
  role: '',
  status: 'Applied',
  workType: 'Remote',
  location: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
}
