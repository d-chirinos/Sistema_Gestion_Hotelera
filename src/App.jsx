
import { useEffect, useState } from 'react'
import './App.css'

// ==========================================
// DATOS TEMPORALES DE HABITACIONES
// ==========================================

const tiposHabitacionIniciales = [
  { id_tipo: 1, nombre: 'Simple', descripcion: 'Habitación individual', capacidad: 1, precio_base: 120 },
  { id_tipo: 2, nombre: 'Doble', descripcion: 'Habitación para dos personas', capacidad: 2, precio_base: 180 },
  { id_tipo: 3, nombre: 'Suite', descripcion: 'Habitación tipo suite', capacidad: 2, precio_base: 340 },
  { id_tipo: 4, nombre: 'Familiar', descripcion: 'Habitación amplia para familias', capacidad: 4, precio_base: 280 },
]

// Datos temporales del hotel relacionado con las habitaciones.
// Los campos no registrados se muestran como 'No registrado' en el detalle.
const hotelesIniciales = [
  { id_hotel: 1, nombre: 'Hotel Los Andes', direccion: 'Av. Larco 1234', ciudad: 'Lima', pais: 'Perú', telefono: '014445566', email: 'contacto@hotelandes.example', categoria: '4 estrellas' },
]

const habitacionesIniciales = [
  { id: 101, hotel_id_hotel: 1, tipo_habitacion_id_tipo: 1, numero: '101', piso: 1, estado: 'DISPONIBLE' },
  { id: 102, hotel_id_hotel: 1, tipo_habitacion_id_tipo: 2, numero: '102', piso: 1, estado: 'DISPONIBLE' },
  { id: 201, hotel_id_hotel: 1, tipo_habitacion_id_tipo: 2, numero: '201', piso: 2, estado: 'MANTENIMIENTO' },
  { id: 301, hotel_id_hotel: 1, tipo_habitacion_id_tipo: 3, numero: '301', piso: 3, estado: 'DISPONIBLE' },
  { id: 202, hotel_id_hotel: 1, tipo_habitacion_id_tipo: 2, numero: '202', piso: 2, estado: 'DISPONIBLE' },
  { id: 203, hotel_id_hotel: 1, tipo_habitacion_id_tipo: 4, numero: '203', piso: 2, estado: 'OCUPADA' },
]

// ==========================================
// DATOS TEMPORALES DE RESERVAS
// ==========================================

const reservasIniciales = [
  {
    id_reserva: 1,
    cliente_id_cliente: 1,
    habitacion_id_habitacion: 102,
    fecha_entrada: '2026-03-10',
    fecha_salida: '2026-03-13',
    estado: 'COMPLETADA',
    total_estimado: 600,
    fecha_reserva: '2026-03-01',
    monto_adelanto: 0,
  },
  {
    id_reserva: 2,
    cliente_id_cliente: 2,
    habitacion_id_habitacion: 301,
    fecha_entrada: '2026-06-05',
    fecha_salida: '2026-06-08',
    estado: 'COMPLETADA',
    total_estimado: 1050,
    fecha_reserva: '2026-05-20',
    monto_adelanto: 0,
  },
  {
    id_reserva: 3,
    cliente_id_cliente: 3,
    habitacion_id_habitacion: 101,
    fecha_entrada: '2026-11-10',
    fecha_salida: '2026-11-12',
    estado: 'CONFIRMADA',
    total_estimado: 240,
    fecha_reserva: '2026-10-25',
    monto_adelanto: 0,
  },
  {
    id_reserva: 4,
    cliente_id_cliente: 3,
    habitacion_id_habitacion: 301,
    fecha_entrada: '2026-11-15',
    fecha_salida: '2026-11-18',
    estado: 'CONFIRMADA',
    total_estimado: 600,
    fecha_reserva: '2026-11-04',
    monto_adelanto: 0,
  },
  {
    id_reserva: 5,
    cliente_id_cliente: 4,
    habitacion_id_habitacion: 203,
    fecha_entrada: '2026-11-02',
    fecha_salida: '2026-11-05',
    estado: 'CONFIRMADA',
    total_estimado: 450,
    fecha_reserva: '2026-10-20',
    monto_adelanto: 150,
  },
  {
    id_reserva: 6,
    cliente_id_cliente: 5,
    habitacion_id_habitacion: 101,
    fecha_entrada: '2026-11-20',
    fecha_salida: '2026-11-23',
    estado: 'CONFIRMADA',
    total_estimado: 510,
    fecha_reserva: '2026-11-01',
    monto_adelanto: 100,
  },
  {
    id_reserva: 7,
    cliente_id_cliente: 6,
    habitacion_id_habitacion: 202,
    fecha_entrada: '2026-11-10',
    fecha_salida: '2026-11-12',
    estado: 'CONFIRMADA',
    total_estimado: 360,
    fecha_reserva: '2026-10-30',
    monto_adelanto: 80,
  },
  {
    id_reserva: 8,
    cliente_id_cliente: 1,
    habitacion_id_habitacion: 301,
    fecha_entrada: '2026-11-20',
    fecha_salida: '2026-11-22',
    estado: 'CONFIRMADA',
    total_estimado: 680,
    fecha_reserva: '2026-11-02',
    monto_adelanto: 200,
  },
  {
    id_reserva: 9,
    cliente_id_cliente: 2,
    habitacion_id_habitacion: 102,
    fecha_entrada: '2026-11-12',
    fecha_salida: '2026-11-14',
    estado: 'CANCELADA',
    total_estimado: 360,
    fecha_reserva: '2026-10-28',
    monto_adelanto: 0,
  },
]

// ==========================================
// DATOS TEMPORALES DE CLIENTES
// ==========================================

const clientesIniciales = [
  {
    id: 1,
    nombre: 'Carlos',
    apellido: 'Pérez',
    documento: '70000001',
    email: 'carlos@example.com',
    telefono: '987654321',
    nacionalidad: 'Peruana',
  },
  {
    id: 2,
    nombre: 'María',
    apellido: 'Torres',
    documento: '70000002',
    email: 'maria@example.com',
    telefono: '987654322',
    nacionalidad: 'Peruana',
  },
  {
    id: 3,
    nombre: 'Luis',
    apellido: 'Gómez',
    documento: '70000003',
    email: 'luis@example.com',
    telefono: '987654323',
    nacionalidad: 'Peruana',
  },
  {
    id: 4,
    nombre: 'Diego',
    apellido: 'Herrera',
    documento: '70000004',
    email: 'diego.herrera@example.com',
    telefono: '900000004',
    nacionalidad: 'Peruana',
  },
  {
    id: 5,
    nombre: 'Elena',
    apellido: 'Ruiz',
    documento: '70000005',
    email: 'elena.ruiz@example.com',
    telefono: '900000005',
    nacionalidad: 'Chilena',
  },
  {
    id: 6,
    nombre: 'Pablo',
    apellido: 'Medina',
    documento: '70000006',
    email: 'pablo.medina@example.com',
    telefono: '900000006',
    nacionalidad: 'Argentina',
  },
]

// DATOS TEMPORALES DE EMPLEADOS (atributos de la tabla EMPLEADO)
const cargosIniciales = [
  { id_cargo: 1, nombre: 'Recepcionista', salario_base: 2400 },
  { id_cargo: 2, nombre: 'Técnico de mantenimiento', salario_base: 2800 },
  { id_cargo: 3, nombre: 'Administrador', salario_base: 5200 },
  { id_cargo: 4, nombre: 'Electricista', salario_base: 3000 },
  { id_cargo: 5, nombre: 'Plomero', salario_base: 2850 },
  { id_cargo: 6, nombre: 'Técnico de climatización', salario_base: 3100 },
  { id_cargo: 7, nombre: 'Pintor', salario_base: 2600 },
]

const empleadosIniciales = [
  { id: 1, hotel_id_hotel: 1, cargo_id_cargo: 1, nombre: 'Ana', apellido: 'López', documento: '80000001', fechaIngreso: '2021-02-15' },
  { id: 2, hotel_id_hotel: 1, cargo_id_cargo: 2, nombre: 'Pedro', apellido: 'Ramírez', documento: '80000002', fechaIngreso: '2020-08-03' },
  { id: 3, hotel_id_hotel: 1, cargo_id_cargo: 3, nombre: 'Sofía', apellido: 'Castro', documento: '80000003', fechaIngreso: '2019-04-22' },
  { id: 4, hotel_id_hotel: 1, cargo_id_cargo: 4, nombre: 'Luis', apellido: 'Fernández', documento: '80000004', fechaIngreso: '2022-01-10' },
  { id: 5, hotel_id_hotel: 1, cargo_id_cargo: 5, nombre: 'Miguel', apellido: 'Sánchez', documento: '80000005', fechaIngreso: '2021-09-06' },
  { id: 6, hotel_id_hotel: 1, cargo_id_cargo: 6, nombre: 'Jorge', apellido: 'Díaz', documento: '80000006', fechaIngreso: '2023-03-13' },
  { id: 7, hotel_id_hotel: 1, cargo_id_cargo: 7, nombre: 'Carmen', apellido: 'Vargas', documento: '80000007', fechaIngreso: '2022-06-01' },
  { id: 8, hotel_id_hotel: 1, cargo_id_cargo: 1, nombre: 'Valeria', apellido: 'Soto', documento: '80000008', fechaIngreso: '2025-01-20' },
]

// ==========================================
// DATOS TEMPORALES DE MANTENIMIENTO
// ==========================================

const mantenimientosIniciales = [
  {
    id_mantenimiento: 1,
    habitacion_id_habitacion: 101,
    empleado_id_empleado: 4,
    fecha_inicio: '2026-01-15',
    tipo: 'Revisión eléctrica',
    costo: 150,
  },
  {
    id_mantenimiento: 2,
    habitacion_id_habitacion: 102,
    empleado_id_empleado: 5,
    fecha_inicio: '2026-04-12',
    tipo: 'Reparación de ducha',
    costo: 220,
  },
  {
    id_mantenimiento: 3,
    habitacion_id_habitacion: 201,
    empleado_id_empleado: 7,
    fecha_inicio: '2026-08-20',
    tipo: 'Pintura',
    costo: 300,
  },
  {
    id_mantenimiento: 4,
    habitacion_id_habitacion: 301,
    empleado_id_empleado: 6,
    fecha_inicio: '2026-10-15',
    tipo: 'Aire acondicionado',
    costo: 180,
  },
  {
    id_mantenimiento: 5,
    habitacion_id_habitacion: 201,
    empleado_id_empleado: 2,
    fecha_inicio: '2026-11-03',
    tipo: 'Revisión de ducha',
    costo: 240,
  },
]

// ==========================================
// DATOS TEMPORALES DE SERVICIOS
// ==========================================

const consumosServiciosIniciales = [
  { id_consumo: 1, estadia_id_estadia: 1, servicio_id_servicio: 1, cantidad: 2, subtotal: 60 },
  { id_consumo: 2, estadia_id_estadia: 1, servicio_id_servicio: 2, cantidad: 1, subtotal: 20 },
  { id_consumo: 3, estadia_id_estadia: 3, servicio_id_servicio: 3, cantidad: 1, subtotal: 60 },
]

const estadiasIniciales = [
  { id_estadia: 1, reserva_id_reserva: 1, empleado_id_empleado: 4, fecha_check_in: '2026-03-10', fecha_check_out: '2026-03-13' },
  { id_estadia: 2, reserva_id_reserva: 2, empleado_id_empleado: 5, fecha_check_in: '2026-06-05', fecha_check_out: '2026-06-08' },
  { id_estadia: 3, reserva_id_reserva: 5, empleado_id_empleado: 2, fecha_check_in: '2026-11-02', fecha_check_out: '2026-11-05' },
]

const serviciosIniciales = [
  {
    id: 1,
    hotel_id_hotel: 1,
    nombre: 'Desayuno',
    precio: 30,
  },
  {
    id: 2,
    hotel_id_hotel: 1,
    nombre: 'Lavandería',
    precio: 20,
  },
  {
    id: 3,
    hotel_id_hotel: 1,
    nombre: 'Traslado aeropuerto',
    precio: 60,
  },
  {
    id: 4,
    hotel_id_hotel: 1,
    nombre: 'Acceso al spa',
    precio: 45,
  },
]

// ==========================================
// DATOS TEMPORALES DE PAGOS
// ==========================================

const pagosIniciales = [
  { id_pago: 1, estadia_id_estadia: 1, fecha_pago: '2026-03-11', monto: 240, metodo_pago: 'Tarjeta' },
  { id_pago: 2, estadia_id_estadia: 1, fecha_pago: '2026-03-12', monto: 120, metodo_pago: 'Efectivo' },
  { id_pago: 3, estadia_id_estadia: 3, fecha_pago: '2026-11-03', monto: 150, metodo_pago: 'Transferencia' },
]

const atributosFiltrosReserva = [
  { campo: 'id_reserva', etiqueta: 'ID_RESERVA (PK)', tipo: 'numero' },
  { campo: 'cliente_id_cliente', etiqueta: 'CLIENTE_ID_CLIENTE (FK)', tipo: 'cliente' },
  { campo: 'habitacion_id_habitacion', etiqueta: 'HABITACION_ID_HABITACION (FK)', tipo: 'habitacion' },
  { campo: 'fecha_entrada', etiqueta: 'FECHA_ENTRADA', tipo: 'fecha' },
  { campo: 'fecha_salida', etiqueta: 'FECHA_SALIDA', tipo: 'fecha' },
  { campo: 'estado', etiqueta: 'ESTADO', tipo: 'estado' },
  { campo: 'total_estimado', etiqueta: 'TOTAL_ESTIMADO', tipo: 'numero' },
  { campo: 'fecha_reserva', etiqueta: 'FECHA_RESERVA', tipo: 'fecha' },
  { campo: 'monto_adelanto', etiqueta: 'MONTO_ADELANTO', tipo: 'numero' },
]

const permisosRecepcionista = {
  Reservas: { visualizar: true, registrar: true, editar: true, cancelar: true },
  Estadias: { visualizar: true, registrar: true, editar: true },
  Clientes: { visualizar: true, registrar: true, editar: true },
  Habitaciones: { visualizar: true },
  'Tipos de habitación': { visualizar: true },
  Pagos: { visualizar: true, registrar: true },
  Consumos: { visualizar: true, registrar: true },
  Servicios: { visualizar: true },
}

const permisosTecnicoMantenimiento = {
  Habitaciones: { visualizar: true },
  Mantenimiento: { visualizar: true, registrar: true, editar: true },
}

const permisosPorCargoEmpleado = {
  Recepcionista: permisosRecepcionista,
  'Técnico de mantenimiento': permisosTecnicoMantenimiento,
}

const moduloInicialEmpleado = cargoNombre =>
  Object.entries(permisosPorCargoEmpleado[cargoNombre] ?? {}).find(([, permiso]) => permiso.visualizar)?.[0] ?? 'Habitaciones'

function SortableHeader({ label, field, sort, onSort }) {
  const active = sort?.field === field
  const direction = active ? sort.direction : null
  return (
    <th aria-sort={direction ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button type="button" className="table-sort-button" onClick={() => onSort(field)}>
        {label}<span aria-hidden="true">{direction === 'asc' ? '▲' : direction === 'desc' ? '▼' : '↕'}</span>
      </button>
    </th>
  )
}

function ClearFiltersButton({ onClick }) {
  return <button type="button" className="list-clear-button" onClick={onClick}>Limpiar filtros</button>
}

function DynamicListFilterPanel({ title, listKey, searchValue, searchPlaceholder, attributes, activeFilters, onSearchChange, onAddFilter, onRemoveFilter, onClearFilters }) {
  const [selectedField, setSelectedField] = useState('')
  const [draftValue, setDraftValue] = useState('')
  const availableAttributes = attributes.filter(attribute => !activeFilters.some(filter => filter.campo === attribute.campo))
  const selectedAttribute = attributes.find(attribute => attribute.campo === selectedField)

  const addFilter = () => {
    if (!selectedAttribute || draftValue === '') return
    onAddFilter(listKey, { campo: selectedAttribute.campo, valor: draftValue })
    setSelectedField('')
    setDraftValue('')
  }

  const clearFilters = () => {
    setSelectedField('')
    setDraftValue('')
    onClearFilters(listKey)
  }

  const getDisplayValue = filter => {
    const attribute = attributes.find(item => item.campo === filter.campo)
    const option = attribute?.opciones?.find(item => String(item.valor) === String(filter.valor))
    return option?.etiqueta ?? filter.valor
  }

  return (
    <>
      <div className="room-filters reservations-filters list-filter-row dynamic-filter-search-row">
        <label className="reservation-search"><span aria-hidden="true">⌕</span><input type="search" value={searchValue} onChange={event => onSearchChange(event.target.value)} placeholder={searchPlaceholder} aria-label={`Búsqueda general de ${title.toLowerCase()}`} /></label>
        <ClearFiltersButton onClick={clearFilters} />
      </div>
      <section className="reservations-filter-builder" aria-label={`Filtros avanzados de ${title}`}>
        <div className="reservations-filter-builder-heading"><strong>Filtrar por</strong><span>Agrega criterios y se aplicarán todos simultáneamente.</span></div>
        <div className="reservations-filter-builder-controls">
          <select aria-label={`Atributo de ${title} para filtrar`} value={selectedField} onChange={event => { setSelectedField(event.target.value); setDraftValue('') }}>
            <option value="">Selecciona un atributo</option>
            {availableAttributes.map(attribute => <option key={attribute.campo} value={attribute.campo}>{attribute.etiqueta}</option>)}
          </select>
          {selectedAttribute?.tipo === 'selector' && <select aria-label={`Valor para ${selectedAttribute.etiqueta}`} value={draftValue} onChange={event => setDraftValue(event.target.value)}><option value="">Selecciona una opción</option>{(selectedAttribute.opciones || []).map(option => <option key={option.valor} value={option.valor}>{option.etiqueta}</option>)}</select>}
          {selectedAttribute?.tipo === 'texto' && <input type="text" aria-label={`Valor para ${selectedAttribute.etiqueta}`} value={draftValue} onChange={event => setDraftValue(event.target.value)} placeholder="Introduce un valor" />}
          {selectedAttribute?.tipo === 'numero' && <input type="number" step="any" aria-label={`Valor para ${selectedAttribute.etiqueta}`} value={draftValue} onChange={event => setDraftValue(event.target.value)} placeholder="Introduce un número" />}
          {selectedAttribute?.tipo === 'fecha' && <input type="date" aria-label={`Valor para ${selectedAttribute.etiqueta}`} value={draftValue} onChange={event => setDraftValue(event.target.value)} />}
          <button type="button" className="reservations-filter-add-button" onClick={addFilter} disabled={!selectedAttribute || draftValue === ''}>Agregar filtro</button>
        </div>
        <div className="reservations-active-filters" aria-live="polite">
          {activeFilters.length ? activeFilters.map(filter => {
            const attribute = attributes.find(item => item.campo === filter.campo)
            return <span className="reservations-active-filter" key={filter.campo}><span><strong>{attribute?.etiqueta}:</strong> {getDisplayValue(filter)}</span><button type="button" aria-label={`Quitar filtro ${attribute?.etiqueta}`} onClick={() => onRemoveFilter(listKey, filter.campo)}>×</button></span>
          }) : <span className="reservations-no-active-filters">No hay filtros avanzados activos.</span>}
        </div>
      </section>
    </>
  )
}

function ListPagination({ totalItems, page, pageSize, totalPages, onPageChange, onPageSizeChange }) {
  if (totalItems <= 10 && pageSize === 10) return null
  const firstItem = totalItems ? ((page - 1) * pageSize) + 1 : 0
  const lastItem = Math.min(page * pageSize, totalItems)
  return (
    <div className="list-pagination" aria-label="Paginación de resultados">
      <label>Filas por página<select value={pageSize} onChange={event => onPageSizeChange(Number(event.target.value))}><option value="10">10</option><option value="25">25</option><option value="50">50</option></select></label>
      <span className="list-pagination-range">{firstItem}–{lastItem} de {totalItems}</span>
      <div className="list-pagination-controls"><button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>Anterior</button><span>Página {page} de {totalPages}</span><button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>Siguiente</button></div>
    </div>
  )
}

function DetailPrimaryKey({ label, value, accessory = null }) {
  return (
    <div className="reservation-detail-code-row reservation-detail-primary-key">
      <div><span>{label}</span><strong>{value}</strong></div>
      {accessory}
    </div>
  )
}

function DetailRelatedRecords({ title, rows, columns, emptyMessage }) {
  return (
    <section className="reservation-detail-group detail-related-records">
      <div className="detail-related-heading"><h3>{title}</h3><span>{rows.length} registros</span></div>
      {rows.length ? <div className="table-container detail-related-table-wrap"><table className="rooms-table detail-related-table"><thead><tr>{columns.map(column => <th key={column.key}>{column.label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id ?? row.id_estadia ?? row.id_pago ?? row.id_consumo ?? row.id_reserva ?? row.id_mantenimiento}>{columns.map(column => <td key={column.key}>{column.render(row)}</td>)}</tr>)}</tbody></table></div> : <p className="detail-related-empty">{emptyMessage}</p>}
    </section>
  )
}

function WelcomeScreen({ empleados, cargos, hoteles, isAdminAuthenticated, employeeSession, onAdminAuthenticated, onEmployeeContinue }) {
  const [phase, setPhase] = useState('intro')
  const [screen, setScreen] = useState('selection')
  const [employeeId, setEmployeeId] = useState('')
  const [employeeDocument, setEmployeeDocument] = useState('')
  const [employeeError, setEmployeeError] = useState('')
  const [employeeContinueError, setEmployeeContinueError] = useState('')
  const [verifiedEmployee, setVerifiedEmployee] = useState(null)
  const [showEmployeeDocument, setShowEmployeeDocument] = useState(false)
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminMessage, setAdminMessage] = useState('')
  const [showAdminPassword, setShowAdminPassword] = useState(false)

  useEffect(() => {
    const transitionTimer = window.setTimeout(() => setPhase('transition'), 1900)
    const readyTimer = window.setTimeout(() => setPhase('ready'), 3000)

    return () => {
      window.clearTimeout(transitionTimer)
      window.clearTimeout(readyTimer)
    }
  }, [])

  const options = [
    {
      id: 'admin',
      title: 'Administrador',
      description: 'Entorno de administración general de HotelManager.',
      icon: (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M8 40V15l16-8 16 8v25M17 40V26h14v14M15 18h.01M24 18h.01M33 18h.01" />
          <path d="M5 40h38" />
        </svg>
      ),
    },
    {
      id: 'employee',
      title: 'Empleado',
      description: 'Entorno operativo según el cargo asignado.',
      icon: (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="16" r="8" />
          <path d="M9 41c1.6-8.1 7-12 15-12s13.4 3.9 15 12" />
        </svg>
      ),
    },
  ]

  function openAccess(access) {
    setScreen(access)
    setEmployeeError('')
    setAdminMessage('')
    setVerifiedEmployee(null)
    setEmployeeContinueError('')
  }

  function returnToOptions() {
    setScreen('selection')
    setEmployeeId('')
    setEmployeeDocument('')
    setEmployeeError('')
    setVerifiedEmployee(null)
    setEmployeeContinueError('')
    setShowEmployeeDocument(false)
    setAdminUsername('')
    setAdminPassword('')
    setAdminMessage('')
    setShowAdminPassword(false)
  }

  function validateEmployeeAccess(event) {
    event.preventDefault()
    const submittedId = employeeId.trim()
    const submittedDocument = employeeDocument.trim()
    const employee = empleados.find(item =>
      String(item.id ?? item.id_empleado) === submittedId
      && String(item.documento ?? '').trim() === submittedDocument
    )

    if (!employee) {
      setEmployeeError('El ID del empleado o el documento no coinciden. Verifica los datos e inténtalo de nuevo.')
      setVerifiedEmployee(null)
      return
    }

    const hotel = hoteles.find(item => Number(item.id_hotel) === Number(employee.hotel_id_hotel)) ?? null
    const cargo = cargos.find(item => Number(item.id_cargo) === Number(employee.cargo_id_cargo)) ?? null
    setEmployeeError('')
    setVerifiedEmployee({ employee, hotel, cargo })
    setScreen('employee-verified')
  }

  function submitAdminAccess(event) {
    event.preventDefault()
    if (adminUsername.trim() !== 'admin' || adminPassword !== '123456') {
      setAdminMessage('El usuario o la contraseña son incorrectos. Verifica tus credenciales e inténtalo de nuevo.')
      return
    }

    setAdminMessage('')
    onAdminAuthenticated()
  }

  function continueEmployeeAccess() {
    const cargoEmpleado = verifiedEmployee?.cargo?.nombre
    if (!permisosPorCargoEmpleado[cargoEmpleado]) {
      setEmployeeContinueError('El entorno operativo todavía no está habilitado para el cargo de este empleado.')
      return
    }
    if (!verifiedEmployee.hotel) {
      setEmployeeContinueError('No se encontró un hotel asociado a este empleado. Contacta al administrador.')
      return
    }
    setEmployeeContinueError('')
    onEmployeeContinue(verifiedEmployee)
  }

  function renderAccessIcon(id) {
    return options.find(option => option.id === id)?.icon ?? options[1].icon
  }

  if (isAdminAuthenticated || employeeSession) return null

  return (
    <main className={`welcome-screen welcome-screen--${phase}`} aria-label={screen === 'selection' ? 'Bienvenida a HotelManager' : `Acceso ${screen.startsWith('employee') ? 'de empleado' : 'de administrador'}`}>
      <div className="welcome-brand" aria-label="HotelManager">
        <span className="welcome-brand-mark" aria-hidden="true">
          <svg viewBox="0 0 56 56">
            <path d="M9 48V18L28 7l19 11v30M18 48V31h20v17M17 21h.01M28 21h.01M39 21h.01" />
            <path d="M5 48h46M28 31v17" />
          </svg>
        </span>
        <span className="welcome-brand-name">Hotel<span>Manager</span></span>
      </div>

      {phase !== 'intro' && (
        <section className={`welcome-access welcome-access--${screen}`} key={screen} aria-labelledby="welcome-title">
          {screen === 'selection' && <>
            <p className="welcome-eyebrow">GESTIÓN HOTELERA</p>
            <h1 id="welcome-title">Bienvenido a HotelManager</h1>
            <p className="welcome-subtitle">Selecciona el tipo de acceso para continuar.</p>

            <div className="welcome-options">
              {options.map(option => (
                <button key={option.id} type="button" className="welcome-option" onClick={() => openAccess(option.id)}>
                  <span className={`welcome-option-icon welcome-option-icon--${option.id}`}>{option.icon}</span>
                  <span className="welcome-option-copy">
                    <strong>{option.title}</strong>
                    <span>{option.description}</span>
                  </span>
                  <span className="welcome-option-action">Continuar <span aria-hidden="true">→</span></span>
                </button>
              ))}
            </div>

            <p className="welcome-note">El acceso y la autenticación se habilitarán en una siguiente etapa.</p>
          </>}

          {(screen === 'employee' || screen === 'admin') && <div className="welcome-form-card">
            <button type="button" className="welcome-back-button" onClick={returnToOptions}>← Volver a la bienvenida</button>
            <div className="welcome-form-heading">
              <span className={`welcome-option-icon welcome-option-icon--${screen}`}>{renderAccessIcon(screen)}</span>
              <div>
                <p className="welcome-form-eyebrow">ACCESO {screen === 'employee' ? 'DE EMPLEADO' : 'ADMINISTRADOR GENERAL'}</p>
                <h1 id="welcome-title">{screen === 'employee' ? 'Iniciar sesión como empleado' : 'Administrador general'}</h1>
              </div>
            </div>

            {screen === 'employee' ? <form className="welcome-login-form" onSubmit={validateEmployeeAccess}>
              <p className="welcome-form-description">Ingresa tu ID de empleado y el documento registrado para tu cuenta de demostración.</p>
              <label className="welcome-input-field"><span>ID del empleado (ID_EMPLEADO)</span><input type="text" inputMode="numeric" autoComplete="username" value={employeeId} onChange={event => setEmployeeId(event.target.value)} placeholder="Ingresa tu ID" required /></label>
              <label className="welcome-input-field"><span>Documento (DOCUMENTO)</span><span className="welcome-password-control"><input type={showEmployeeDocument ? 'text' : 'password'} autoComplete="current-password" value={employeeDocument} onChange={event => setEmployeeDocument(event.target.value)} placeholder="Ingresa tu documento" required /><button type="button" className="welcome-password-toggle" aria-label={showEmployeeDocument ? 'Ocultar documento' : 'Mostrar documento'} aria-pressed={showEmployeeDocument} onClick={() => setShowEmployeeDocument(value => !value)}>{showEmployeeDocument ? 'Ocultar' : 'Mostrar'}</button></span></label>
              {employeeError && <p className="welcome-form-error" role="alert">{employeeError}</p>}
              <button type="submit" className="welcome-submit-button">Verificar acceso</button>
              <p className="welcome-form-footnote">Validación temporal con los datos de demostración actuales.</p>
            </form> : <form className="welcome-login-form" onSubmit={submitAdminAccess}>
              <p className="welcome-form-description">Acceso independiente para el Administrador general.</p>
              <label className="welcome-input-field"><span>Usuario o correo electrónico</span><input type="text" autoComplete="username" value={adminUsername} onChange={event => setAdminUsername(event.target.value)} placeholder="Ingresa tu usuario o correo" required /></label>
              <label className="welcome-input-field"><span>Contraseña</span><span className="welcome-password-control"><input type={showAdminPassword ? 'text' : 'password'} autoComplete="current-password" value={adminPassword} onChange={event => setAdminPassword(event.target.value)} placeholder="Ingresa tu contraseña" required /><button type="button" className="welcome-password-toggle" aria-label={showAdminPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showAdminPassword} onClick={() => setShowAdminPassword(value => !value)}>{showAdminPassword ? 'Ocultar' : 'Mostrar'}</button></span></label>
              {adminMessage && <p className="welcome-form-error" role="alert">{adminMessage}</p>}
              <button type="submit" className="welcome-submit-button">Iniciar sesión</button>
              <p className="welcome-form-footnote">Credenciales temporales de demostración; no usar como acceso de producción.</p>
            </form>}
          </div>}

          {screen === 'employee-verified' && verifiedEmployee && <div className="welcome-form-card welcome-verified-card">
            <button type="button" className="welcome-back-button" onClick={returnToOptions}>← Volver a la bienvenida</button>
            <div className="welcome-form-heading">
              <span className="welcome-verified-mark" aria-hidden="true">✓</span>
              <div><p className="welcome-form-eyebrow">CREDENCIALES VERIFICADAS</p><h1 id="welcome-title">Identidad confirmada</h1></div>
            </div>
            <p className="welcome-form-description">Se identificaron el empleado y sus registros relacionados.</p>
            <dl className="welcome-identity-details">
              <div><dt>Empleado</dt><dd>{verifiedEmployee.employee.nombre} {verifiedEmployee.employee.apellido}</dd></div>
              <div><dt>ID_EMPLEADO</dt><dd>{verifiedEmployee.employee.id ?? verifiedEmployee.employee.id_empleado}</dd></div>
              <div><dt>Cargo relacionado</dt><dd>{verifiedEmployee.cargo?.nombre ?? 'No encontrado'}</dd></div>
              <div><dt>Hotel relacionado</dt><dd>{verifiedEmployee.hotel?.nombre ?? 'No encontrado'}</dd></div>
            </dl>
            {employeeContinueError && <p className="welcome-form-error" role="alert">{employeeContinueError}</p>}
            <p className="welcome-form-footnote">El acceso operativo se habilita según el cargo y el hotel relacionados.</p>
            <button type="button" className="welcome-submit-button" onClick={continueEmployeeAccess}>Ingresar al sistema</button>
          </div>}
        </section>
      )}
    </main>
  )
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

function App() {

  // ESTADO GENERAL
  const [seccionActiva, setSeccionActiva] = useState('Dashboard')
  const [adminAuthenticated, setAdminAuthenticated] = useState(false)
  const [employeeSession, setEmployeeSession] = useState(null)
  const [hoteles, setHoteles] = useState(hotelesIniciales)
  const [busquedaHotel, setBusquedaHotel] = useState('')
  const [mostrarModalHotel, setMostrarModalHotel] = useState(false)
  const [hotelEnEdicion, setHotelEnEdicion] = useState(null)
  const [hotelSeleccionado, setHotelSeleccionado] = useState(null)
  const [hotelPorEliminar, setHotelPorEliminar] = useState(null)
  const [formularioHotel, setFormularioHotel] = useState({ nombre: '', direccion: '', ciudad: '', pais: '', telefono: '', email: '', categoria: '' })
  const [errorHotel, setErrorHotel] = useState('')

  // ESTADOS DE HABITACIONES
  const [habitaciones, setHabitaciones] = useState(habitacionesIniciales)
  const [tiposHabitacion, setTiposHabitacion] = useState(tiposHabitacionIniciales)
  const [subseccionHabitaciones, setSubseccionHabitaciones] = useState('habitaciones')
  const [busquedaTipo, setBusquedaTipo] = useState('')
  const [mostrarModalTipo, setMostrarModalTipo] = useState(false)
  const [tipoEnEdicion, setTipoEnEdicion] = useState(null)
  const [tipoPorEliminar, setTipoPorEliminar] = useState(null)
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null)
  const [formularioTipo, setFormularioTipo] = useState({ nombre: '', descripcion: '', capacidad: '', precio_base: '' })
  const [errorTipo, setErrorTipo] = useState('')
  const [mostrarModalHabitacion, setMostrarModalHabitacion] = useState(false)
  const [nuevaHabitacion, setNuevaHabitacion] = useState({ numero: '', tipo: '', piso: '', estado: 'DISPONIBLE', hotel_id_hotel: hoteles[0] ? String(hoteles[0].id_hotel) : '' })
  const [errorHabitacion, setErrorHabitacion] = useState('')
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null)
  const [habitacionEnEdicion, setHabitacionEnEdicion] = useState(null)
  const [formularioHabitacionEdicion, setFormularioHabitacionEdicion] = useState({ numero: '', tipo: '', piso: '', estado: 'DISPONIBLE', hotel_id_hotel: '' })
  const [errorEdicionHabitacion, setErrorEdicionHabitacion] = useState('')
  const [habitacionPorEliminar, setHabitacionPorEliminar] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  // ESTADOS DE RESERVAS
  const [reservas, setReservas] = useState(reservasIniciales)
  const [subseccionReservas, setSubseccionReservas] = useState('reservas')
  const [estadias, setEstadias] = useState(estadiasIniciales)
  const [busquedaEstadia, setBusquedaEstadia] = useState('')
  const [mostrarModalEstadia, setMostrarModalEstadia] = useState(false)
  const [estadiaEnEdicion, setEstadiaEnEdicion] = useState(null)
  const [estadiaSeleccionada, setEstadiaSeleccionada] = useState(null)
  const [estadiaPorEliminar, setEstadiaPorEliminar] = useState(null)
  const [formularioEstadia, setFormularioEstadia] = useState({ reserva_id_reserva: '', empleado_id_empleado: '', fecha_check_in: '', fecha_check_out: '' })
  const [errorEstadia, setErrorEstadia] = useState('')
  const [busquedaReserva, setBusquedaReserva] = useState('')
  const [filtrosAvanzadosReserva, setFiltrosAvanzadosReserva] = useState([])
  const [campoFiltroReserva, setCampoFiltroReserva] = useState('')
  const [valorFiltroReserva, setValorFiltroReserva] = useState('')
  const [mostrarModalReserva, setMostrarModalReserva] = useState(false)
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null)
  const [clienteReserva, setClienteReserva] = useState('')
  const [habitacionReserva, setHabitacionReserva] = useState('')
  const [entradaReserva, setEntradaReserva] = useState('')
  const [salidaReserva, setSalidaReserva] = useState('')
  const [totalReserva, setTotalReserva] = useState('')
  const [adelantoReserva, setAdelantoReserva] = useState('0')
  const [errorReserva, setErrorReserva] = useState('')
  const [reservaEnEdicion, setReservaEnEdicion] = useState(null)
  const [formularioEdicion, setFormularioEdicion] = useState({ cliente: '', habitacion: '', entrada: '', salida: '', total: '', adelanto: '0', estado: 'CONFIRMADA' })
  const [errorEdicion, setErrorEdicion] = useState('')
  const [reservaPorCancelar, setReservaPorCancelar] = useState(null)

  // ESTADOS DE CLIENTES
  const [clientes, setClientes] = useState(clientesIniciales)
  const [clientesRegistradosEnSesion, setClientesRegistradosEnSesion] = useState([])
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [mostrarModalCliente, setMostrarModalCliente] = useState(false)
  const [clienteEnEdicion, setClienteEnEdicion] = useState(null)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [clientePorEliminar, setClientePorEliminar] = useState(null)
  const [formularioCliente, setFormularioCliente] = useState({ nombre: '', apellido: '', documento: '', email: '', telefono: '', nacionalidad: '' })
  const [errorCliente, setErrorCliente] = useState('')
  // ESTADOS DE EMPLEADOS
  const [empleados, setEmpleados] = useState(empleadosIniciales)
  const [cargos, setCargos] = useState(cargosIniciales)
  const [subseccionEmpleados, setSubseccionEmpleados] = useState('empleados')
  const [busquedaCargo, setBusquedaCargo] = useState('')
  const [mostrarModalCargo, setMostrarModalCargo] = useState(false)
  const [cargoEnEdicion, setCargoEnEdicion] = useState(null)
  const [cargoSeleccionado, setCargoSeleccionado] = useState(null)
  const [cargoPorEliminar, setCargoPorEliminar] = useState(null)
  const [formularioCargo, setFormularioCargo] = useState({ nombre: '', salario_base: '' })
  const [errorCargo, setErrorCargo] = useState('')
  const [busquedaEmpleado, setBusquedaEmpleado] = useState('')
  const [mostrarModalEmpleado, setMostrarModalEmpleado] = useState(false)
  const [empleadoEnEdicion, setEmpleadoEnEdicion] = useState(null)
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null)
  const [empleadoPorEliminar, setEmpleadoPorEliminar] = useState(null)
  const [formularioEmpleado, setFormularioEmpleado] = useState({ nombre: '', apellido: '', documento: '', fechaIngreso: '', cargo_id_cargo: '1', hotel_id_hotel: hoteles[0] ? String(hoteles[0].id_hotel) : '' })
  const [errorEmpleado, setErrorEmpleado] = useState('')

  // ESTADOS DE MANTENIMIENTO
  const [mantenimientos, setMantenimientos] = useState(mantenimientosIniciales)
  const [busquedaMantenimiento, setBusquedaMantenimiento] = useState('')
  const [mostrarModalMantenimiento, setMostrarModalMantenimiento] = useState(false)
  const [mantenimientoEnEdicion, setMantenimientoEnEdicion] = useState(null)
  const [mantenimientoSeleccionado, setMantenimientoSeleccionado] = useState(null)
  const [mantenimientoPorEliminar, setMantenimientoPorEliminar] = useState(null)
  const [formularioMantenimiento, setFormularioMantenimiento] = useState({ fecha_inicio: '', tipo: '', costo: '', habitacion_id_habitacion: '', empleado_id_empleado: '' })
  const [errorMantenimiento, setErrorMantenimiento] = useState('')

  // ESTADOS DE SERVICIOS
  const [servicios, setServicios] = useState(serviciosIniciales)
  const [consumosServicios, setConsumosServicios] = useState(consumosServiciosIniciales)
  const [subseccionServicios, setSubseccionServicios] = useState('consumos')
  const [busquedaConsumo, setBusquedaConsumo] = useState('')
  const [mostrarModalConsumo, setMostrarModalConsumo] = useState(false)
  const [consumoEnEdicion, setConsumoEnEdicion] = useState(null)
  const [consumoSeleccionado, setConsumoSeleccionado] = useState(null)
  const [consumoPorEliminar, setConsumoPorEliminar] = useState(null)
  const [formularioConsumo, setFormularioConsumo] = useState({ estadia_id_estadia: '', servicio_id_servicio: '', cantidad: '1', subtotal: '' })
  const [errorConsumo, setErrorConsumo] = useState('')
  const [busquedaServicio, setBusquedaServicio] = useState('')
  const [mostrarModalServicio, setMostrarModalServicio] = useState(false)
  const [servicioEnEdicion, setServicioEnEdicion] = useState(null)
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null)
  const [servicioPorEliminar, setServicioPorEliminar] = useState(null)
  const [formularioServicio, setFormularioServicio] = useState({ nombre: '', precio: '', hotel_id_hotel: hoteles[0] ? String(hoteles[0].id_hotel) : '' })
  const [errorServicio, setErrorServicio] = useState('')

  // ESTADOS DE PAGOS
  const [pagos, setPagos] = useState(pagosIniciales)
  const [busquedaPago, setBusquedaPago] = useState('')
  const [mostrarModalPago, setMostrarModalPago] = useState(false)
  const [pagoEnEdicion, setPagoEnEdicion] = useState(null)
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null)
  const [pagoPorEliminar, setPagoPorEliminar] = useState(null)
  const [formularioPago, setFormularioPago] = useState({ estadia_id_estadia: '', fecha_pago: '', monto: '', metodo_pago: '' })
  const [errorPago, setErrorPago] = useState('')

  // ESTADO COMPARTIDO DE FILTROS, ORDEN Y PAGINACIÓN DE LISTADOS
  const [filtrosAvanzadosLista, setFiltrosAvanzadosLista] = useState({})
  const [ordenesLista, setOrdenesLista] = useState({})
  const [paginasLista, setPaginasLista] = useState({})
  const [tamanosPaginaLista, setTamanosPaginaLista] = useState({})

  const obtenerFiltrosActivosLista = lista => filtrosAvanzadosLista[lista] || []

  const coincideFiltrosAvanzadosLista = (registro, lista, atributos) => obtenerFiltrosActivosLista(lista).every(filtro => {
    const atributo = atributos.find(item => item.campo === filtro.campo)
    if (!atributo) return true
    const valorRegistro = atributo.obtenerValor ? atributo.obtenerValor(registro) : registro[atributo.campo]
    if (atributo.tipo === 'texto') return String(valorRegistro ?? '').toLowerCase().includes(String(filtro.valor).toLowerCase())
    if (atributo.tipo === 'numero' || atributo.compararNumero) {
      const valor = Number(filtro.valor)
      return Number.isFinite(valor) && Number(valorRegistro) === valor
    }
    return String(valorRegistro ?? '') === String(filtro.valor)
  })

  const agregarFiltroAvanzadoLista = (lista, filtro) => {
    setFiltrosAvanzadosLista(actuales => ({
      ...actuales,
      [lista]: (actuales[lista] || []).some(item => item.campo === filtro.campo)
        ? actuales[lista]
        : [...(actuales[lista] || []), filtro],
    }))
    setPaginasLista(actuales => ({ ...actuales, [lista]: 1 }))
  }

  const quitarFiltroAvanzadoLista = (lista, campo) => {
    setFiltrosAvanzadosLista(actuales => ({ ...actuales, [lista]: (actuales[lista] || []).filter(item => item.campo !== campo) }))
    setPaginasLista(actuales => ({ ...actuales, [lista]: 1 }))
  }

  const limpiarFiltrosAvanzadosLista = lista => {
    setFiltrosAvanzadosLista(actuales => ({ ...actuales, [lista]: [] }))
    setPaginasLista(actuales => ({ ...actuales, [lista]: 1 }))
  }

  const actualizarFiltroLista = (lista, setter, valor) => {
    setter(valor)
    setPaginasLista(actuales => ({ ...actuales, [lista]: 1 }))
  }

  const alternarOrdenLista = (lista, campo) => {
    setOrdenesLista(actuales => {
      const anterior = actuales[lista]
      return { ...actuales, [lista]: { field: campo, direction: anterior?.field === campo && anterior.direction === 'asc' ? 'desc' : 'asc' } }
    })
    setPaginasLista(actuales => ({ ...actuales, [lista]: 1 }))
  }

  const ordenarRegistros = (registros, lista, accesores = {}) => {
    const orden = ordenesLista[lista]
    if (!orden) return registros
    const accesor = accesores[orden.field] || (registro => registro[orden.field])
    return [...registros].sort((primero, segundo) => {
      const valorPrimero = accesor(primero)
      const valorSegundo = accesor(segundo)
      const numeroPrimero = Number(valorPrimero)
      const numeroSegundo = Number(valorSegundo)
      const ambosNumericos = valorPrimero !== '' && valorSegundo !== '' && Number.isFinite(numeroPrimero) && Number.isFinite(numeroSegundo)
      const comparacion = ambosNumericos
        ? numeroPrimero - numeroSegundo
        : String(valorPrimero ?? '').localeCompare(String(valorSegundo ?? ''), 'es', { numeric: true, sensitivity: 'base' })
      return orden.direction === 'desc' ? -comparacion : comparacion
    })
  }

  const prepararPaginaLista = (lista, registros, accesores = {}) => {
    const ordenados = ordenarRegistros(registros, lista, accesores)
    const pageSize = tamanosPaginaLista[lista] || 10
    const totalPages = Math.max(1, Math.ceil(ordenados.length / pageSize))
    const page = Math.min(paginasLista[lista] || 1, totalPages)
    return { rows: ordenados.slice((page - 1) * pageSize, page * pageSize), page, pageSize, totalPages }
  }

  const cambiarPaginaLista = (lista, pagina) => setPaginasLista(actuales => ({ ...actuales, [lista]: pagina }))

  const cambiarTamanoPaginaLista = (lista, tamano) => {
    setTamanosPaginaLista(actuales => ({ ...actuales, [lista]: tamano }))
    setPaginasLista(actuales => ({ ...actuales, [lista]: 1 }))
  }

  // OPCIONES DEL MENU
  const opcionesMenuAdministrativas = [
    'Dashboard',
    'Hoteles',
    'Reservas',
    'Habitaciones',
    'Clientes',
    'Empleados',
    'Consumos',
    'Pagos',
    'Mantenimiento',
  ]

  const permisosActivosEmpleado = employeeSession ? permisosPorCargoEmpleado[employeeSession.cargo?.nombre] ?? {} : {}
  const puedeVerModulo = modulo => !employeeSession || Boolean(permisosActivosEmpleado[modulo]?.visualizar)
  const puedeCrearEnModulo = modulo => !employeeSession || Boolean(permisosActivosEmpleado[modulo]?.registrar)
  const puedeEditarEnModulo = modulo => !employeeSession || Boolean(permisosActivosEmpleado[modulo]?.editar)
  const puedeEliminarEnModulo = () => !employeeSession
  const puedeCancelarReservas = () => !employeeSession || Boolean(permisosActivosEmpleado.Reservas?.cancelar)
  const opcionesMenu = employeeSession
    ? ['Reservas', 'Habitaciones', 'Clientes', 'Consumos', 'Pagos', 'Mantenimiento'].filter(modulo => puedeVerModulo(modulo))
    : opcionesMenuAdministrativas

  // ==========================================
  // RELACIONES DEL MODELO RELACIONAL (JOIN EN MEMORIA)
  // ==========================================

  const obtenerCargoEmpleado = (empleado) =>
    cargos.find(cargo => Number(cargo.id_cargo) === Number(empleado.cargo_id_cargo))

  const obtenerHotelEmpleado = (empleado) =>
    hoteles.find(hotel => Number(hotel.id_hotel) === Number(empleado.hotel_id_hotel))

  const hotelSesionId = Number(employeeSession?.hotel?.id_hotel)
  const habitacionesVisibles = employeeSession
    ? habitaciones.filter(habitacion => Number(habitacion.hotel_id_hotel) === hotelSesionId)
    : habitaciones
  const habitacionEnHotelSesion = habitacionId => habitacionesVisibles.some(habitacion => Number(habitacion.id) === Number(habitacionId))
  const mantenimientoEnHotelSesion = mantenimiento => habitacionEnHotelSesion(mantenimiento.habitacion_id_habitacion)
  const mantenimientosVisibles = employeeSession ? mantenimientos.filter(mantenimientoEnHotelSesion) : mantenimientos
  const reservaEnHotelSesion = reserva => habitacionEnHotelSesion(reserva.habitacion_id_habitacion)
  const reservasVisibles = employeeSession ? reservas.filter(reservaEnHotelSesion) : reservas
  const reservaIdsVisibles = new Set(reservasVisibles.map(reserva => Number(reserva.id_reserva)))
  const estadiasVisibles = employeeSession
    ? estadias.filter(estadia => reservaIdsVisibles.has(Number(estadia.reserva_id_reserva)))
    : estadias
  const estadiaIdsVisibles = new Set(estadiasVisibles.map(estadia => Number(estadia.id_estadia)))
  const clientesDeReservasVisibles = new Set(reservasVisibles.map(reserva => Number(reserva.cliente_id_cliente)))
  const clientesVisibles = employeeSession
    ? clientes.filter(cliente => clientesDeReservasVisibles.has(Number(cliente.id)) || clientesRegistradosEnSesion.includes(Number(cliente.id)))
    : clientes
  const empleadosDelHotel = employeeSession
    ? empleados.filter(empleado => Number(empleado.hotel_id_hotel) === hotelSesionId)
    : empleados
  const serviciosVisibles = employeeSession
    ? servicios.filter(servicio => Number(servicio.hotel_id_hotel) === hotelSesionId)
    : servicios
  const consumosVisibles = employeeSession
    ? consumosServicios.filter(consumo => estadiaIdsVisibles.has(Number(consumo.estadia_id_estadia)))
    : consumosServicios
  const pagosVisibles = employeeSession
    ? pagos.filter(pago => estadiaIdsVisibles.has(Number(pago.estadia_id_estadia)))
    : pagos

  const obtenerClienteReserva = (reserva) =>
    clientesVisibles.find(cliente => Number(cliente.id) === Number(reserva.cliente_id_cliente))

  const obtenerHabitacionReserva = (reserva) =>
    habitacionesVisibles.find(habitacion => Number(habitacion.id) === Number(reserva.habitacion_id_habitacion))

  const nombreClienteReserva = (reserva) => {
    const cliente = obtenerClienteReserva(reserva)
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente no encontrado'
  }

  const numeroHabitacionReserva = (reserva) => {
    const habitacion = obtenerHabitacionReserva(reserva)
    return habitacion ? habitacion.numero : '—'
  }

  const nombreTipoHabitacion = (habitacion) => {
    const tipo = tiposHabitacion.find(item => item.id_tipo === habitacion.tipo_habitacion_id_tipo)
    return tipo ? tipo.nombre : 'Tipo no encontrado'
  }

  const codigoReserva = (id) => `RES-${String(id).padStart(3, '0')}`

  // Presenta las fechas ISO (AAAA-MM-DD) sin alterar el día por zonas horarias.
  const formatearFechaReserva = (fecha) => {
    if (!fecha) return '—'
    const [anio, mes, dia] = fecha.split('-')
    return `${dia}/${mes}/${anio}`
  }

  const formatearMontoReserva = (monto) =>
    `S/ ${Number(monto || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const opcionesFiltroDesde = (registros, campoId, etiqueta) => registros.map(registro => ({
    valor: String(registro[campoId]),
    etiqueta: etiqueta(registro),
  }))
  const opcionesHotelesFiltro = opcionesFiltroDesde(employeeSession ? [employeeSession.hotel] : hoteles, 'id_hotel', hotel => hotel.nombre)
  const opcionesHabitacionesFiltro = opcionesFiltroDesde(habitacionesVisibles, 'id', habitacion => `Habitación ${habitacion.numero}`)
  const opcionesTiposHabitacionFiltro = opcionesFiltroDesde(tiposHabitacion, 'id_tipo', tipo => tipo.nombre)
  const opcionesCargosFiltro = opcionesFiltroDesde(cargos, 'id_cargo', cargo => cargo.nombre)
  const opcionesEmpleadosFiltro = opcionesFiltroDesde(empleadosDelHotel, 'id', empleado => `${empleado.nombre} ${empleado.apellido}`)
  const opcionesReservasFiltro = opcionesFiltroDesde(reservasVisibles, 'id_reserva', reserva => `${codigoReserva(reserva.id_reserva)} · ${nombreClienteReserva(reserva)}`)
  const opcionesEstadiasFiltro = opcionesFiltroDesde(estadiasVisibles, 'id_estadia', estadia => `Estadía ${estadia.id_estadia} · ${formatearFechaReserva(estadia.fecha_check_in)}`)
  const opcionesServiciosFiltro = opcionesFiltroDesde(serviciosVisibles, 'id', servicio => servicio.nombre)
  const opcionesMetodosPagoFiltro = [...new Set(pagosVisibles.map(pago => pago.metodo_pago).filter(Boolean))].map(metodo => ({ valor: metodo, etiqueta: metodo }))
  const opcionesEstadosHabitacionFiltro = [...new Set(habitaciones.map(habitacion => habitacion.estado).filter(Boolean))].map(estado => ({ valor: estado, etiqueta: estado }))

  const atributosFiltroHabitaciones = [
    { campo: 'id', etiqueta: 'ID_HABITACION (PK)', tipo: 'numero' },
    { campo: 'hotel_id_hotel', etiqueta: 'HOTEL_ID_HOTEL (FK)', tipo: 'selector', compararNumero: true, opciones: opcionesHotelesFiltro },
    { campo: 'tipo_habitacion_id_tipo', etiqueta: 'TIPO_HABITACION_ID_TIPO (FK)', tipo: 'selector', compararNumero: true, opciones: opcionesTiposHabitacionFiltro },
    { campo: 'numero', etiqueta: 'NUMERO', tipo: 'texto' },
    { campo: 'piso', etiqueta: 'PISO', tipo: 'numero' },
    { campo: 'estado', etiqueta: 'ESTADO', tipo: 'selector', opciones: opcionesEstadosHabitacionFiltro },
  ]
  const atributosFiltroTiposHabitacion = [
    { campo: 'id_tipo', etiqueta: 'ID_TIPO (PK)', tipo: 'numero' },
    { campo: 'nombre', etiqueta: 'NOMBRE', tipo: 'texto' },
    { campo: 'descripcion', etiqueta: 'DESCRIPCION', tipo: 'texto' },
    { campo: 'capacidad', etiqueta: 'CAPACIDAD', tipo: 'numero' },
    { campo: 'precio_base', etiqueta: 'PRECIO_BASE', tipo: 'numero' },
  ]
  const atributosFiltroEstadias = [
    { campo: 'id_estadia', etiqueta: 'ID_ESTADIA (PK)', tipo: 'numero' },
    { campo: 'reserva_id_reserva', etiqueta: 'RESERVA_ID_RESERVA (FK)', tipo: 'selector', compararNumero: true, opciones: opcionesReservasFiltro },
    { campo: 'empleado_id_empleado', etiqueta: 'EMPLEADO_ID_EMPLEADO (FK)', tipo: 'selector', compararNumero: true, opciones: opcionesEmpleadosFiltro },
    { campo: 'fecha_check_in', etiqueta: 'FECHA_CHECK_IN', tipo: 'fecha' },
    { campo: 'fecha_check_out', etiqueta: 'FECHA_CHECK_OUT', tipo: 'fecha' },
  ]
  const atributosFiltroClientes = [
    { campo: 'id', etiqueta: 'ID_CLIENTE (PK)', tipo: 'numero' },
    { campo: 'nombre', etiqueta: 'NOMBRE', tipo: 'texto' },
    { campo: 'apellido', etiqueta: 'APELLIDO', tipo: 'texto' },
    { campo: 'documento', etiqueta: 'DOCUMENTO', tipo: 'texto' },
    { campo: 'email', etiqueta: 'EMAIL', tipo: 'texto' },
    { campo: 'telefono', etiqueta: 'TELEFONO', tipo: 'texto' },
    { campo: 'nacionalidad', etiqueta: 'NACIONALIDAD', tipo: 'texto' },
  ]
  const atributosFiltroEmpleados = [
    { campo: 'id', etiqueta: 'ID_EMPLEADO (PK)', tipo: 'numero' },
    { campo: 'hotel_id_hotel', etiqueta: 'HOTEL_ID_HOTEL (FK)', tipo: 'selector', compararNumero: true, opciones: opcionesHotelesFiltro },
    { campo: 'cargo_id_cargo', etiqueta: 'CARGO_ID_CARGO (FK)', tipo: 'selector', compararNumero: true, opciones: opcionesCargosFiltro },
    { campo: 'nombre', etiqueta: 'NOMBRE', tipo: 'texto' },
    { campo: 'apellido', etiqueta: 'APELLIDO', tipo: 'texto' },
    { campo: 'documento', etiqueta: 'DOCUMENTO', tipo: 'texto' },
    { campo: 'fechaIngreso', etiqueta: 'FECHA_INGRESO', tipo: 'fecha', obtenerValor: empleado => empleado.fechaIngreso ?? empleado.fecha_ingreso },
  ]
  const atributosFiltroCargos = [
    { campo: 'id_cargo', etiqueta: 'ID_CARGO (PK)', tipo: 'numero' },
    { campo: 'nombre', etiqueta: 'NOMBRE', tipo: 'texto' },
    { campo: 'salario_base', etiqueta: 'SALARIO_BASE', tipo: 'numero' },
  ]
  const atributosFiltroServicios = [
    { campo: 'id', etiqueta: 'ID_SERVICIO (PK)', tipo: 'numero' },
    { campo: 'hotel_id_hotel', etiqueta: 'HOTEL_ID_HOTEL (FK)', tipo: 'selector', compararNumero: true, opciones: opcionesHotelesFiltro },
    { campo: 'nombre', etiqueta: 'NOMBRE', tipo: 'texto' },
    { campo: 'precio', etiqueta: 'PRECIO', tipo: 'numero' },
  ]
  const atributosFiltroConsumos = [
    { campo: 'id_consumo', etiqueta: 'ID_CONSUMO (PK)', tipo: 'numero' },
    { campo: 'estadia_id_estadia', etiqueta: 'ESTADIA_ID_ESTADIA (FK)', tipo: 'selector', compararNumero: true, opciones: opcionesEstadiasFiltro },
    { campo: 'servicio_id_servicio', etiqueta: 'SERVICIO_ID_SERVICIO (FK)', tipo: 'selector', compararNumero: true, opciones: opcionesServiciosFiltro },
    { campo: 'cantidad', etiqueta: 'CANTIDAD', tipo: 'numero' },
    { campo: 'subtotal', etiqueta: 'SUBTOTAL', tipo: 'numero' },
  ]
  const atributosFiltroPagos = [
    { campo: 'id_pago', etiqueta: 'ID_PAGO (PK)', tipo: 'numero' },
    { campo: 'estadia_id_estadia', etiqueta: 'ESTADIA_ID_ESTADIA (FK)', tipo: 'selector', compararNumero: true, opciones: opcionesEstadiasFiltro },
    { campo: 'fecha_pago', etiqueta: 'FECHA_PAGO', tipo: 'fecha' },
    { campo: 'monto', etiqueta: 'MONTO', tipo: 'numero' },
    { campo: 'metodo_pago', etiqueta: 'METODO_PAGO', tipo: 'selector', opciones: opcionesMetodosPagoFiltro },
  ]
  const atributosFiltroMantenimiento = [
    { campo: 'id_mantenimiento', etiqueta: 'ID_MANTENIMIENTO (PK)', tipo: 'numero' },
    { campo: 'habitacion_id_habitacion', etiqueta: 'HABITACION_ID_HABITACION (FK)', tipo: 'selector', compararNumero: true, opciones: opcionesHabitacionesFiltro },
    { campo: 'empleado_id_empleado', etiqueta: 'EMPLEADO_ID_EMPLEADO (FK)', tipo: 'selector', compararNumero: true, opciones: opcionesEmpleadosFiltro },
    { campo: 'fecha_inicio', etiqueta: 'FECHA_INICIO', tipo: 'fecha' },
    { campo: 'tipo', etiqueta: 'TIPO', tipo: 'texto' },
    { campo: 'costo', etiqueta: 'COSTO', tipo: 'numero' },
  ]
  const atributosFiltroHoteles = [
    { campo: 'id_hotel', etiqueta: 'ID_HOTEL (PK)', tipo: 'numero' },
    { campo: 'nombre', etiqueta: 'NOMBRE', tipo: 'texto' },
    { campo: 'direccion', etiqueta: 'DIRECCION', tipo: 'texto' },
    { campo: 'ciudad', etiqueta: 'CIUDAD', tipo: 'texto' },
    { campo: 'pais', etiqueta: 'PAIS', tipo: 'texto' },
    { campo: 'telefono', etiqueta: 'TELEFONO', tipo: 'texto' },
    { campo: 'email', etiqueta: 'EMAIL', tipo: 'texto' },
    { campo: 'categoria', etiqueta: 'CATEGORIA', tipo: 'texto' },
  ]

  const hotelesFiltrados = hoteles.filter(hotel => {
    const texto = busquedaHotel.trim().toLowerCase()
    const coincideBusqueda = atributosFiltroHoteles.some(atributo =>
      String(hotel[atributo.campo] ?? '').toLowerCase().includes(texto)
    )
    return coincideBusqueda && coincideFiltrosAvanzadosLista(hotel, 'hoteles', atributosFiltroHoteles)
  })

  function abrirRegistroHotel() {
    if (employeeSession) return
    setHotelEnEdicion(null)
    setFormularioHotel({ nombre: '', direccion: '', ciudad: '', pais: '', telefono: '', email: '', categoria: '' })
    setErrorHotel('')
    setMostrarModalHotel(true)
  }

  function abrirEdicionHotel(hotel) {
    if (employeeSession) return
    setHotelEnEdicion(hotel)
    setFormularioHotel({
      nombre: hotel.nombre ?? '', direccion: hotel.direccion ?? '', ciudad: hotel.ciudad ?? '',
      pais: hotel.pais ?? '', telefono: hotel.telefono ?? '', email: hotel.email ?? '', categoria: hotel.categoria ?? '',
    })
    setErrorHotel('')
    setMostrarModalHotel(true)
  }

  function guardarHotel(evento) {
    evento.preventDefault()
    if (employeeSession) return
    const datos = Object.fromEntries(Object.entries(formularioHotel).map(([campo, valor]) => [campo, valor.trim()]))
    if (Object.values(datos).some(valor => !valor)) {
      setErrorHotel('Completa todos los campos del hotel.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
      setErrorHotel('Ingresa un correo electrónico válido.')
      return
    }

    if (hotelEnEdicion) {
      setHoteles(actuales => actuales.map(hotel => hotel.id_hotel === hotelEnEdicion.id_hotel
        ? { ...hotel, ...datos }
        : hotel))
      setHotelSeleccionado(actual => actual?.id_hotel === hotelEnEdicion.id_hotel
        ? { ...actual, ...datos }
        : actual)
    } else {
      const nuevoId = hoteles.length ? Math.max(...hoteles.map(hotel => Number(hotel.id_hotel))) + 1 : 1
      setHoteles(actuales => [...actuales, { id_hotel: nuevoId, ...datos }])
      setBusquedaHotel('')
      limpiarFiltrosAvanzadosLista('hoteles')
    }

    setPaginasLista(actuales => ({ ...actuales, hoteles: 1 }))
    setMostrarModalHotel(false)
    setHotelEnEdicion(null)
    setFormularioHotel({ nombre: '', direccion: '', ciudad: '', pais: '', telefono: '', email: '', categoria: '' })
    setErrorHotel('')
  }

  function obtenerDependenciasHotel(hotel) {
    return {
      habitaciones: habitaciones.filter(item => Number(item.hotel_id_hotel) === Number(hotel.id_hotel)),
      empleados: empleados.filter(item => Number(item.hotel_id_hotel) === Number(hotel.id_hotel)),
      servicios: servicios.filter(item => Number(item.hotel_id_hotel) === Number(hotel.id_hotel)),
    }
  }

  function confirmarEliminarHotel() {
    if (!puedeEliminarEnModulo()) return
    if (!hotelPorEliminar) return
    const dependencias = obtenerDependenciasHotel(hotelPorEliminar)
    if (dependencias.habitaciones.length || dependencias.empleados.length || dependencias.servicios.length) return
    setHoteles(actuales => actuales.filter(hotel => hotel.id_hotel !== hotelPorEliminar.id_hotel))
    setHotelSeleccionado(actual => actual?.id_hotel === hotelPorEliminar.id_hotel ? null : actual)
    setHotelPorEliminar(null)
  }

  function abrirDetalleReserva(reserva) {
    setReservaSeleccionada(reserva)
  }

  function abrirConfirmacionCancelacion(reserva) {
    if (!puedeCancelarReservas() || !reservaEnHotelSesion(reserva) || reserva.estado !== 'CONFIRMADA') return
    setReservaPorCancelar(reserva)
  }

  function reservaTieneEstadiaAsociada(reserva) {
    return estadias.some(estadia => Number(estadia.reserva_id_reserva) === Number(reserva.id_reserva))
  }

  function confirmarCancelacionReserva() {
    if (!puedeCancelarReservas() || !reservaPorCancelar || !reservaEnHotelSesion(reservaPorCancelar) || reservaPorCancelar.estado !== 'CONFIRMADA') return
    if (reservaTieneEstadiaAsociada(reservaPorCancelar)) return

    setReservas(reservasAnteriores => reservasAnteriores.map(reserva =>
      reserva.id_reserva === reservaPorCancelar.id_reserva
        ? { ...reserva, estado: 'CANCELADA' }
        : reserva
    ))
    setReservaPorCancelar(null)
  }

  function abrirEdicionReserva(reserva) {
    // Las reservas canceladas se conservan como historial y no pueden modificarse.
    if (!puedeEditarEnModulo('Reservas') || !reservaEnHotelSesion(reserva) || reserva.estado === 'CANCELADA') return
    setReservaEnEdicion(reserva)
    setFormularioEdicion({
      cliente: String(reserva.cliente_id_cliente),
      habitacion: String(reserva.habitacion_id_habitacion),
      entrada: reserva.fecha_entrada,
      salida: reserva.fecha_salida,
      total: String(reserva.total_estimado),
      adelanto: String(reserva.monto_adelanto ?? 0),
      estado: reserva.estado,
    })
    setErrorEdicion('')
  }

  function guardarEdicionReserva(evento) {
    evento.preventDefault()
    setErrorEdicion('')

    if (!puedeEditarEnModulo('Reservas') || !reservaEnEdicion || !reservaEnHotelSesion(reservaEnEdicion)) return
    if (reservaEnEdicion.estado === 'CANCELADA') {
      setErrorEdicion('Una reserva cancelada no se puede modificar.')
      return
    }
    const total = Number(formularioEdicion.total)
    const adelanto = formularioEdicion.adelanto === '' ? 0 : Number(formularioEdicion.adelanto)
    const idCliente = Number(formularioEdicion.cliente)
    const idHabitacion = Number(formularioEdicion.habitacion)

    if (!formularioEdicion.cliente || !formularioEdicion.habitacion || !formularioEdicion.entrada || !formularioEdicion.salida || formularioEdicion.total === '') {
      setErrorEdicion('Completa los campos obligatorios para guardar los cambios.')
      return
    }
    if (formularioEdicion.salida <= formularioEdicion.entrada) {
      setErrorEdicion('La fecha de salida debe ser posterior a la fecha de entrada.')
      return
    }
    if (!Number.isFinite(total) || total <= 0) {
      setErrorEdicion('El total estimado debe ser mayor que cero.')
      return
    }
    if (!Number.isFinite(adelanto) || adelanto < 0) {
      setErrorEdicion('El monto de adelanto no puede ser negativo.')
      return
    }
    if (adelanto > total) {
      setErrorEdicion('El adelanto no puede superar el total estimado.')
      return
    }

    const clienteExiste = clientesVisibles.some(cliente => Number(cliente.id) === idCliente)
    const habitacionSeleccionada = habitacionesVisibles.find(habitacion => Number(habitacion.id) === idHabitacion)
    if (!clienteExiste || !habitacionSeleccionada) {
      setErrorEdicion('Selecciona un cliente y una habitación registrados.')
      return
    }
    if (habitacionSeleccionada.estado !== 'DISPONIBLE' && idHabitacion !== reservaEnEdicion.habitacion_id_habitacion) {
      setErrorEdicion('La nueva habitación debe encontrarse disponible.')
      return
    }

    if (formularioEdicion.estado === 'CONFIRMADA') {
      const existeCruce = reservasVisibles.some(reserva => {
        if (reserva.id_reserva === reservaEnEdicion.id_reserva) return false
        if (reserva.habitacion_id_habitacion !== idHabitacion || ['CANCELADA', 'COMPLETADA'].includes(reserva.estado)) return false
        return formularioEdicion.entrada < reserva.fecha_salida && formularioEdicion.salida > reserva.fecha_entrada
      })
      if (existeCruce) {
        setErrorEdicion('La habitación ya tiene otra reserva activa que coincide con esas fechas.')
        return
      }
    }

    const cambiosReserva = {
      cliente_id_cliente: idCliente,
      habitacion_id_habitacion: idHabitacion,
      fecha_entrada: formularioEdicion.entrada,
      fecha_salida: formularioEdicion.salida,
      total_estimado: total,
      monto_adelanto: adelanto,
      estado: formularioEdicion.estado,
    }

    setReservas(reservasAnteriores => reservasAnteriores.map(reserva =>
      reserva.id_reserva === reservaEnEdicion.id_reserva ? { ...reserva, ...cambiosReserva } : reserva
    ))
    setReservaEnEdicion(null)
    setErrorEdicion('')
  }

  function abrirModalReserva() {
    if (!puedeCrearEnModulo('Reservas')) return
    setClienteReserva('')
    setHabitacionReserva('')
    setEntradaReserva('')
    setSalidaReserva('')
    setTotalReserva('')
    setAdelantoReserva('0')
    setErrorReserva('')
    setMostrarModalReserva(true)
  }

  function registrarReserva(evento) {
    evento.preventDefault()
    setErrorReserva('')

    if (!puedeCrearEnModulo('Reservas')) return

    if (!clienteReserva || !habitacionReserva || !entradaReserva || !salidaReserva || totalReserva === '') {
      setErrorReserva('Completa los campos obligatorios para registrar la reserva.')
      return
    }

    const total = Number(totalReserva)
    const adelanto = adelantoReserva === '' ? 0 : Number(adelantoReserva)

    if (salidaReserva <= entradaReserva) {
      setErrorReserva('La fecha de salida debe ser posterior a la fecha de entrada.')
      return
    }
    if (!Number.isFinite(total) || total <= 0) {
      setErrorReserva('El total estimado debe ser mayor que cero.')
      return
    }
    if (!Number.isFinite(adelanto) || adelanto < 0) {
      setErrorReserva('El monto de adelanto no puede ser negativo.')
      return
    }
    if (adelanto > total) {
      setErrorReserva('El adelanto no puede superar el total estimado.')
      return
    }

    const idCliente = Number(clienteReserva)
    const idHabitacion = Number(habitacionReserva)
    const clienteExiste = clientesVisibles.some(cliente => Number(cliente.id) === idCliente)
    const habitacionSeleccionada = habitacionesVisibles.find(habitacion => Number(habitacion.id) === idHabitacion)

    if (!clienteExiste || !habitacionSeleccionada) {
      setErrorReserva('Selecciona un cliente y una habitación registrados.')
      return
    }
    if (habitacionSeleccionada.estado !== 'DISPONIBLE') {
      setErrorReserva('La habitación seleccionada no está disponible.')
      return
    }

    // Una habitación no puede tener reservas activas con fechas superpuestas.
    const existeCruce = reservasVisibles.some(reserva => {
      if (reserva.habitacion_id_habitacion !== idHabitacion || ['CANCELADA', 'COMPLETADA'].includes(reserva.estado)) return false
      return entradaReserva < reserva.fecha_salida && salidaReserva > reserva.fecha_entrada
    })

    if (existeCruce) {
      setErrorReserva('La habitación ya tiene una reserva activa que coincide con esas fechas.')
      return
    }

    const nuevoId = reservas.length ? Math.max(...reservas.map(reserva => reserva.id_reserva)) + 1 : 1
    const fechaHoy = new Date()
    const fechaRegistro = `${fechaHoy.getFullYear()}-${String(fechaHoy.getMonth() + 1).padStart(2, '0')}-${String(fechaHoy.getDate()).padStart(2, '0')}`

    // Estructura alineada con las columnas de la tabla RESERVA del modelo.
    const nuevaReserva = {
      id_reserva: nuevoId,
      cliente_id_cliente: idCliente,
      habitacion_id_habitacion: idHabitacion,
      fecha_entrada: entradaReserva,
      fecha_salida: salidaReserva,
      estado: 'CONFIRMADA',
      total_estimado: total,
      fecha_reserva: fechaRegistro,
      monto_adelanto: adelanto,
    }

    setReservas(reservasAnteriores => [...reservasAnteriores, nuevaReserva])
    setMostrarModalReserva(false)
    setBusquedaReserva('')
    setFiltrosAvanzadosReserva([])
    setPaginasLista(actuales => ({ ...actuales, reservas: 1 }))
  }

  // ==========================================
  // REGISTRAR HABITACION
  // ==========================================

  function abrirRegistroHabitacion() {
    if (!puedeCrearEnModulo('Habitaciones')) return
    setNuevaHabitacion({ numero: '', tipo: '', piso: '', estado: 'DISPONIBLE', hotel_id_hotel: hoteles[0] ? String(hoteles[0].id_hotel) : '' })
    setErrorHabitacion('')
    setMostrarModalHabitacion(true)
  }

  function registrarHabitacion(evento) {
    evento.preventDefault()
    if (!puedeCrearEnModulo('Habitaciones')) return

    const numero = nuevaHabitacion.numero.trim()
    const tipoId = Number(nuevaHabitacion.tipo)
    const piso = Number(nuevaHabitacion.piso)
    const hotelId = Number(nuevaHabitacion.hotel_id_hotel)
    const hotelExiste = employeeSession
      ? hotelId === hotelSesionId
      : hoteles.some(hotel => Number(hotel.id_hotel) === hotelId)

    if (!numero || !tipoId || !Number.isInteger(piso) || piso < 1 || !nuevaHabitacion.hotel_id_hotel || !hotelExiste) {
      setErrorHabitacion('Completa todos los campos con valores válidos.')
      return
    }

    if (habitaciones.some(habitacion => habitacion.numero.toLowerCase() === numero.toLowerCase())) {
      setErrorHabitacion('Ya existe una habitación registrada con ese número.')
      return
    }

    const nuevoId = habitaciones.length
      ? Math.max(...habitaciones.map(habitacion => Number(habitacion.id))) + 1
      : 1

    const registro = {
      id: nuevoId,
      hotel_id_hotel: hotelId,
      tipo_habitacion_id_tipo: tipoId,
      numero,
      piso,
      estado: nuevaHabitacion.estado,
    }

    setHabitaciones(actuales => [...actuales, registro])
    setMostrarModalHabitacion(false)
    setNuevaHabitacion({ numero: '', tipo: '', piso: '', estado: 'DISPONIBLE', hotel_id_hotel: hoteles[0] ? String(hoteles[0].id_hotel) : '' })
    setBusqueda('')
  }

  // ==========================================
  // EDITAR HABITACION
  // ==========================================

  function abrirEdicionHabitacion(habitacion) {
    if (!puedeEditarEnModulo('Habitaciones') || !habitacionEnHotelSesion(habitacion.id)) return
    setHabitacionEnEdicion(habitacion)
    setFormularioHabitacionEdicion({
      numero: habitacion.numero,
      tipo: String(habitacion.tipo_habitacion_id_tipo),
      piso: String(habitacion.piso),
      estado: habitacion.estado,
      hotel_id_hotel: String(habitacion.hotel_id_hotel ?? ''),
    })
    setErrorEdicionHabitacion('')
  }

  function guardarEdicionHabitacion(evento) {
    evento.preventDefault()
    if (!puedeEditarEnModulo('Habitaciones') || (habitacionEnEdicion && !habitacionEnHotelSesion(habitacionEnEdicion.id))) return

    if (!habitacionEnEdicion) return

    const numero = formularioHabitacionEdicion.numero.trim()
    const tipoId = Number(formularioHabitacionEdicion.tipo)
    const piso = Number(formularioHabitacionEdicion.piso)
    const hotelId = Number(formularioHabitacionEdicion.hotel_id_hotel)
    const hotelExiste = employeeSession
      ? hotelId === hotelSesionId
      : hoteles.some(hotel => Number(hotel.id_hotel) === hotelId)

    if (!numero || !tipoId || !Number.isInteger(piso) || piso < 1 || !formularioHabitacionEdicion.hotel_id_hotel || !hotelExiste) {
      setErrorEdicionHabitacion('Completa todos los campos con valores válidos.')
      return
    }

    const numeroDuplicado = habitaciones.some(habitacion =>
      habitacion.id !== habitacionEnEdicion.id &&
      habitacion.numero.toLowerCase() === numero.toLowerCase()
    )

    if (numeroDuplicado) {
      setErrorEdicionHabitacion('Ya existe otra habitación registrada con ese número.')
      return
    }

    setHabitaciones(actuales => actuales.map(habitacion =>
      habitacion.id === habitacionEnEdicion.id
        ? {
            ...habitacion,
            numero,
            tipo_habitacion_id_tipo: tipoId,
            piso,
            estado: formularioHabitacionEdicion.estado,
            hotel_id_hotel: hotelId,
          }
        : habitacion
    ))

    // Si el detalle de esta habitación estaba abierto, actualizarlo también.
    setHabitacionSeleccionada(actual =>
      actual?.id === habitacionEnEdicion.id
        ? {
            ...actual,
            numero,
            tipo_habitacion_id_tipo: tipoId,
            piso,
            estado: formularioHabitacionEdicion.estado,
            hotel_id_hotel: hotelId,
          }
        : actual
    )

    setHabitacionEnEdicion(null)
    setErrorEdicionHabitacion('')
    setBusqueda('')
  }

  // ==========================================
  // ELIMINAR HABITACION
  // ==========================================

  function abrirConfirmacionEliminarHabitacion(habitacion) {
    if (!puedeEliminarEnModulo() || !habitacionEnHotelSesion(habitacion.id)) return
    setHabitacionPorEliminar(habitacion)
  }

  function confirmarEliminarHabitacion() {
    if (!puedeEliminarEnModulo()) return
    if (!habitacionPorEliminar) return

    // Se revisan todas las reservas, incluso las completadas o canceladas,
    // porque siguen siendo registros relacionados con esta habitación.
    const tieneReservasAsociadas = reservas.some(
      reserva => Number(reserva.habitacion_id_habitacion) === Number(habitacionPorEliminar.id)
    )
    const tieneMantenimientosAsociados = mantenimientos.some(
      mantenimiento => Number(mantenimiento.habitacion_id_habitacion) === Number(habitacionPorEliminar.id)
    )

    if (tieneReservasAsociadas || tieneMantenimientosAsociados) return

    setHabitaciones(actuales => actuales.filter(
      habitacion => habitacion.id !== habitacionPorEliminar.id
    ))
    setHabitacionSeleccionada(actual =>
      actual?.id === habitacionPorEliminar.id ? null : actual
    )
    setHabitacionEnEdicion(actual =>
      actual?.id === habitacionPorEliminar.id ? null : actual
    )
    setHabitacionPorEliminar(null)
  }

  // ==========================================
  // CRUD DE TIPOS DE HABITACION
  // ==========================================

  function abrirRegistroTipo() {
    if (!puedeCrearEnModulo('Tipos de habitación')) return
    setTipoEnEdicion(null)
    setFormularioTipo({ nombre: '', descripcion: '', capacidad: '', precio_base: '' })
    setErrorTipo('')
    setMostrarModalTipo(true)
  }

  function abrirEdicionTipo(tipo) {
    if (!puedeEditarEnModulo('Tipos de habitación')) return
    setTipoEnEdicion(tipo)
    setFormularioTipo({ nombre: tipo.nombre, descripcion: tipo.descripcion || '', capacidad: String(tipo.capacidad), precio_base: tipo.precio_base == null ? '' : String(tipo.precio_base) })
    setErrorTipo('')
    setMostrarModalTipo(true)
  }

  function guardarTipoHabitacion(evento) {
    evento.preventDefault()
    if (!puedeCrearEnModulo('Tipos de habitación') && !puedeEditarEnModulo('Tipos de habitación')) return
    const nombre = formularioTipo.nombre.trim()
    const descripcion = formularioTipo.descripcion.trim()
    const capacidad = Number(formularioTipo.capacidad)
    const precio = formularioTipo.precio_base === '' ? null : Number(formularioTipo.precio_base)
    if (!nombre || !Number.isInteger(capacidad) || capacidad < 1 || (precio !== null && (!Number.isFinite(precio) || precio < 0))) {
      setErrorTipo('Ingresa un nombre, una capacidad entera mayor que cero y un precio válido (si corresponde).')
      return
    }
    const nombreDuplicado = tiposHabitacion.some(tipo => tipo.id_tipo !== tipoEnEdicion?.id_tipo && tipo.nombre.trim().toLowerCase() === nombre.toLowerCase())
    if (nombreDuplicado) { setErrorTipo('Ya existe un tipo de habitación con ese nombre.'); return }
    if (tipoEnEdicion) {
      setTiposHabitacion(actuales => actuales.map(tipo => tipo.id_tipo === tipoEnEdicion.id_tipo ? { ...tipo, nombre, descripcion, capacidad, precio_base: precio } : tipo))
    } else {
      const nuevoId = tiposHabitacion.length ? Math.max(...tiposHabitacion.map(tipo => Number(tipo.id_tipo))) + 1 : 1
      setTiposHabitacion(actuales => [...actuales, { id_tipo: nuevoId, nombre, descripcion, capacidad, precio_base: precio }])
    }
    setMostrarModalTipo(false)
    setTipoEnEdicion(null)
    setFormularioTipo({ nombre: '', descripcion: '', capacidad: '', precio_base: '' })
    setErrorTipo('')
  }

  function confirmarEliminarTipo() {
    if (!puedeEliminarEnModulo()) return
    if (!tipoPorEliminar) return
    const tieneHabitaciones = habitaciones.some(habitacion => Number(habitacion.tipo_habitacion_id_tipo) === Number(tipoPorEliminar.id_tipo))
    if (tieneHabitaciones) return
    setTiposHabitacion(actuales => actuales.filter(tipo => tipo.id_tipo !== tipoPorEliminar.id_tipo))
    setTipoPorEliminar(null)
  }

  const tiposHabitacionFiltrados = tiposHabitacion.filter(tipo =>
    `${tipo.nombre} ${tipo.descripcion || ''}`.toLowerCase().includes(busquedaTipo.toLowerCase())
      && coincideFiltrosAvanzadosLista(tipo, 'tipos', atributosFiltroTiposHabitacion)
  )

  // ==========================================
  // FILTRAR HABITACIONES
  // ==========================================

  const habitacionesFiltradas = habitacionesVisibles.filter((habitacion) => {
    const texto = busqueda.trim().toLowerCase()
    const coincideNumero = String(habitacion.numero).toLowerCase().includes(texto)
    const coincidePiso = String(habitacion.piso ?? '').toLowerCase().includes(texto)

    return (coincideNumero || coincidePiso) && coincideFiltrosAvanzadosLista(habitacion, 'habitaciones', atributosFiltroHabitaciones)
  })

  // ==========================================
  // FILTRAR RESERVAS
  // ==========================================

  const reservasFiltradas = reservasVisibles.filter((reserva) => {
    const texto = busquedaReserva.toLowerCase()
    const textoGeneralReserva = [
      codigoReserva(reserva.id_reserva),
      reserva.id_reserva,
      nombreClienteReserva(reserva),
      numeroHabitacionReserva(reserva),
      reserva.fecha_reserva,
      reserva.fecha_entrada,
      reserva.fecha_salida,
      reserva.estado,
      reserva.total_estimado,
      reserva.monto_adelanto,
    ].join(' ').toLowerCase()
    const coincideBusqueda = textoGeneralReserva.includes(texto)
    const coincidenFiltrosAvanzados = filtrosAvanzadosReserva.every(criterio => {
      const atributo = atributosFiltrosReserva.find(item => item.campo === criterio.campo)
      if (!atributo) return true
      const valorRegistro = reserva[criterio.campo]
      return atributo.tipo === 'numero'
        ? Number(valorRegistro) === Number(criterio.valor)
        : String(valorRegistro ?? '') === String(criterio.valor)
    })

    return coincideBusqueda && coincidenFiltrosAvanzados
  })

  const agregarFiltroReserva = () => {
    if (!campoFiltroReserva || valorFiltroReserva === '') return
    setFiltrosAvanzadosReserva(actuales => {
      if (actuales.some(criterio => criterio.campo === campoFiltroReserva)) return actuales
      return [...actuales, { campo: campoFiltroReserva, valor: valorFiltroReserva }]
    })
    setCampoFiltroReserva('')
    setValorFiltroReserva('')
    setPaginasLista(actuales => ({ ...actuales, reservas: 1 }))
  }

  const quitarFiltroReserva = campo => {
    setFiltrosAvanzadosReserva(actuales => actuales.filter(criterio => criterio.campo !== campo))
    setPaginasLista(actuales => ({ ...actuales, reservas: 1 }))
  }

  const limpiarFiltrosReserva = () => {
    setBusquedaReserva('')
    setFiltrosAvanzadosReserva([])
    setCampoFiltroReserva('')
    setValorFiltroReserva('')
    setPaginasLista(actuales => ({ ...actuales, reservas: 1 }))
  }

  const etiquetaValorFiltroReserva = criterio => {
    if (criterio.campo === 'cliente_id_cliente') {
      const cliente = clientes.find(item => Number(item.id) === Number(criterio.valor))
      return cliente ? `${cliente.nombre} ${cliente.apellido}` : criterio.valor
    }
    if (criterio.campo === 'habitacion_id_habitacion') {
      const habitacion = habitaciones.find(item => Number(item.id) === Number(criterio.valor))
      return habitacion ? `Habitación ${habitacion.numero}` : criterio.valor
    }
    return criterio.valor
  }

  // ==========================================
  // GESTIÓN DE ESTADÍAS
  // ==========================================

  const obtenerReservaEstadia = (estadia) =>
    reservasVisibles.find(reserva => Number(reserva.id_reserva) === Number(estadia.reserva_id_reserva))

  const obtenerEmpleadoEstadia = (estadia) =>
    empleadosDelHotel.find(empleado => Number(empleado.id) === Number(estadia.empleado_id_empleado))

  const estadiasFiltradas = estadiasVisibles.filter(estadia => {
    const texto = busquedaEstadia.trim().toLowerCase()
    const reserva = obtenerReservaEstadia(estadia)
    const cliente = reserva ? nombreClienteReserva(reserva) : ''
    const coincideTexto = String(estadia.id_estadia).includes(texto)
      || String(estadia.fecha_check_in || '').toLowerCase().includes(texto)
      || String(estadia.fecha_check_out || '').toLowerCase().includes(texto)
      || String(estadia.reserva_id_reserva || '').includes(texto)
      || cliente.toLowerCase().includes(texto)
    return coincideTexto && coincideFiltrosAvanzadosLista(estadia, 'estadias', atributosFiltroEstadias)
  })

  function abrirRegistroEstadia() {
    if (!puedeCrearEnModulo('Estadias')) return
    setEstadiaEnEdicion(null)
    setFormularioEstadia({ reserva_id_reserva: '', empleado_id_empleado: '', fecha_check_in: '', fecha_check_out: '' })
    setErrorEstadia('')
    setMostrarModalEstadia(true)
  }

  function abrirEdicionEstadia(estadia) {
    if (!puedeEditarEnModulo('Estadias') || !estadiaIdsVisibles.has(Number(estadia.id_estadia))) return
    setEstadiaEnEdicion(estadia)
    setFormularioEstadia({
      reserva_id_reserva: String(estadia.reserva_id_reserva),
      empleado_id_empleado: String(estadia.empleado_id_empleado ?? ''),
      fecha_check_in: estadia.fecha_check_in,
      fecha_check_out: estadia.fecha_check_out,
    })
    setErrorEstadia('')
    setMostrarModalEstadia(true)
  }

  function guardarEstadia(evento) {
    evento.preventDefault()
    setErrorEstadia('')
    if (estadiaEnEdicion ? !puedeEditarEnModulo('Estadias') : !puedeCrearEnModulo('Estadias')) return
    const reservaId = Number(formularioEstadia.reserva_id_reserva)
    const empleadoId = Number(formularioEstadia.empleado_id_empleado)
    const reserva = reservasVisibles.find(item => Number(item.id_reserva) === reservaId)
    const empleadoExiste = empleadosDelHotel.some(item => Number(item.id) === empleadoId)
    if (!reserva) { setErrorEstadia('Selecciona una reserva válida para relacionarla con la estadía.'); return }
    if (!empleadoExiste) { setErrorEstadia('Selecciona un empleado existente responsable de la estadía.'); return }
    if (reserva.estado === 'CANCELADA') { setErrorEstadia('No se puede registrar una estadía para una reserva cancelada.'); return }
    if (!formularioEstadia.fecha_check_in || !formularioEstadia.fecha_check_out) { setErrorEstadia('Completa las fechas de check-in y check-out.'); return }
    if (formularioEstadia.fecha_check_out <= formularioEstadia.fecha_check_in) { setErrorEstadia('La fecha de check-out debe ser posterior a la fecha de check-in.'); return }
    if (estadiaEnEdicion) {
      setEstadias(actuales => actuales.map(item => item.id_estadia === estadiaEnEdicion.id_estadia
        ? { ...item, reserva_id_reserva: reservaId, empleado_id_empleado: empleadoId, fecha_check_in: formularioEstadia.fecha_check_in, fecha_check_out: formularioEstadia.fecha_check_out }
        : item))
    } else {
      const nuevoId = estadias.length ? Math.max(...estadias.map(item => Number(item.id_estadia))) + 1 : 1
      setEstadias(actuales => [...actuales, { id_estadia: nuevoId, reserva_id_reserva: reservaId, empleado_id_empleado: empleadoId, fecha_check_in: formularioEstadia.fecha_check_in, fecha_check_out: formularioEstadia.fecha_check_out }])
    }
    setMostrarModalEstadia(false)
    setEstadiaEnEdicion(null)
  }

  function confirmarEliminarEstadia() {
    if (!puedeEliminarEnModulo()) return
    if (!estadiaPorEliminar) return
    const consumosVinculados = consumosServicios.some(consumo => Number(consumo.estadia_id_estadia) === Number(estadiaPorEliminar.id_estadia))
    const pagosVinculados = pagos.some(pago => Number(pago.estadia_id_estadia) === Number(estadiaPorEliminar.id_estadia))
    if (consumosVinculados || pagosVinculados) {
      const dependencias = [
        consumosVinculados && 'consumos de servicios',
        pagosVinculados && 'pagos',
      ].filter(Boolean).join(' y ')
      setErrorEstadia(`No se puede eliminar esta estadía porque tiene ${dependencias} asociados. Elimina o reasigna esos registros antes de continuar.`)
      return
    }
    setEstadias(actuales => actuales.filter(item => item.id_estadia !== estadiaPorEliminar.id_estadia))
    setEstadiaPorEliminar(null)
    setErrorEstadia('')
  }

  // ==========================================
  // FILTRAR CLIENTES
  // ==========================================

  const clientesFiltrados = clientesVisibles.filter((cliente) => {
    const texto = busquedaCliente.toLowerCase()

    const nombreCompleto =
      `${cliente.nombre} ${cliente.apellido}`.toLowerCase()

    return (
      nombreCompleto.includes(texto) ||
      cliente.documento.toLowerCase().includes(texto) ||
      cliente.email.toLowerCase().includes(texto)
    ) && coincideFiltrosAvanzadosLista(cliente, 'clientes', atributosFiltroClientes)
  })

  // ==========================================
  // CRUD DE CLIENTES
  // ==========================================

  function abrirRegistroCliente() {
    if (!puedeCrearEnModulo('Clientes')) return
    setClienteEnEdicion(null)
    setFormularioCliente({ nombre: '', apellido: '', documento: '', email: '', telefono: '', nacionalidad: '' })
    setErrorCliente('')
    setMostrarModalCliente(true)
  }

  function abrirEdicionCliente(cliente) {
    if (!puedeEditarEnModulo('Clientes') || !clientesVisibles.some(item => Number(item.id) === Number(cliente.id))) return
    setClienteEnEdicion(cliente)
    setFormularioCliente({ nombre: cliente.nombre, apellido: cliente.apellido, documento: cliente.documento, email: cliente.email, telefono: cliente.telefono, nacionalidad: cliente.nacionalidad })
    setErrorCliente('')
    setMostrarModalCliente(true)
  }

  function guardarCliente(evento) {
    evento.preventDefault()
    if (clienteEnEdicion ? !puedeEditarEnModulo('Clientes') : !puedeCrearEnModulo('Clientes')) return
    const datos = Object.fromEntries(Object.entries(formularioCliente).map(([clave, valor]) => [clave, valor.trim()]))
    if (Object.values(datos).some(valor => !valor)) {
      setErrorCliente('Completa todos los campos para registrar al cliente.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
      setErrorCliente('Ingresa un correo electrónico válido.')
      return
    }
    const documentoDuplicado = clientes.some(cliente => cliente.id !== clienteEnEdicion?.id && cliente.documento.toLowerCase() === datos.documento.toLowerCase())
    if (documentoDuplicado) {
      setErrorCliente('Ya existe un cliente registrado con ese documento.')
      return
    }
    if (clienteEnEdicion) {
      setClientes(actuales => actuales.map(cliente => cliente.id === clienteEnEdicion.id ? { ...cliente, ...datos } : cliente))
    } else {
      const nuevoId = clientes.length ? Math.max(...clientes.map(cliente => Number(cliente.id))) + 1 : 1
      setClientes(actuales => [...actuales, { id: nuevoId, ...datos }])
      if (employeeSession) setClientesRegistradosEnSesion(actuales => [...new Set([...actuales, nuevoId])])
    }
    setMostrarModalCliente(false)
    setClienteEnEdicion(null)
    setErrorCliente('')
  }

  function confirmarEliminarCliente() {
    if (!puedeEliminarEnModulo()) return
    if (!clientePorEliminar) return
    const reservasAsociadas = reservas.filter(reserva => Number(reserva.cliente_id_cliente) === Number(clientePorEliminar.id))
    if (reservasAsociadas.length) return
    setClientes(actuales => actuales.filter(cliente => cliente.id !== clientePorEliminar.id))
    setClientePorEliminar(null)
  }

  // ==========================================
  // CRUD Y FILTRO DE EMPLEADOS
  // ==========================================

  function abrirRegistroEmpleado() {
    if (employeeSession) return
    setEmpleadoEnEdicion(null)
    setFormularioEmpleado({ nombre: '', apellido: '', documento: '', fechaIngreso: '', cargo_id_cargo: cargos[0] ? String(cargos[0].id_cargo) : '', hotel_id_hotel: hoteles[0] ? String(hoteles[0].id_hotel) : '' })
    setErrorEmpleado('')
    setMostrarModalEmpleado(true)
  }

  function normalizarFechaIngreso(fecha) {
    if (!fecha) return ''
    const valor = String(fecha).trim()
    const fechaISO = valor.match(/^(\d{4}-\d{2}-\d{2})(?:$|T)/)
    if (fechaISO) return fechaISO[1]
    const fechaLocalizada = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (fechaLocalizada) return `${fechaLocalizada[3]}-${fechaLocalizada[2]}-${fechaLocalizada[1]}`
    const fechaParseada = new Date(valor)
    if (Number.isNaN(fechaParseada.getTime())) return ''
    const anio = fechaParseada.getFullYear()
    const mes = String(fechaParseada.getMonth() + 1).padStart(2, '0')
    const dia = String(fechaParseada.getDate()).padStart(2, '0')
    return `${anio}-${mes}-${dia}`
  }

  function abrirEdicionEmpleado(empleado) {
    if (employeeSession) return
    setEmpleadoEnEdicion(empleado)
    setFormularioEmpleado({
      nombre: empleado.nombre, apellido: empleado.apellido, documento: empleado.documento,
      fechaIngreso: normalizarFechaIngreso(empleado.fechaIngreso ?? empleado.fecha_ingreso),
      cargo_id_cargo: String(empleado.cargo_id_cargo || ''), hotel_id_hotel: String(empleado.hotel_id_hotel ?? ''),
    })
    setErrorEmpleado('')
    setMostrarModalEmpleado(true)
  }

  function guardarEmpleado(evento) {
    evento.preventDefault()
    if (employeeSession) return
    const datos = {
      nombre: formularioEmpleado.nombre.trim(), apellido: formularioEmpleado.apellido.trim(),
      documento: formularioEmpleado.documento.trim(), fechaIngreso: formularioEmpleado.fechaIngreso || normalizarFechaIngreso(empleadoEnEdicion?.fechaIngreso ?? empleadoEnEdicion?.fecha_ingreso),
      cargo_id_cargo: Number(formularioEmpleado.cargo_id_cargo),
      hotel_id_hotel: Number(formularioEmpleado.hotel_id_hotel),
    }
    if (!datos.nombre || !datos.apellido || !datos.documento || !datos.cargo_id_cargo || !formularioEmpleado.hotel_id_hotel) {
      setErrorEmpleado('Completa los datos obligatorios y selecciona un cargo y un hotel.')
      return
    }
    if (!hoteles.some(hotel => Number(hotel.id_hotel) === datos.hotel_id_hotel)) {
      setErrorEmpleado('Selecciona un hotel existente.')
      return
    }
    if (!/^[0-9]{8,15}$/.test(datos.documento)) {
      setErrorEmpleado('El documento debe contener entre 8 y 15 dígitos.')
      return
    }
    const documentoDuplicado = empleados.some(empleado => empleado.id !== empleadoEnEdicion?.id && empleado.documento === datos.documento)
    if (documentoDuplicado) {
      setErrorEmpleado('Ya existe un empleado registrado con ese documento.')
      return
    }
    if (empleadoEnEdicion) {
      setEmpleados(actuales => actuales.map(empleado => empleado.id === empleadoEnEdicion.id ? { ...empleado, ...datos } : empleado))
    } else {
      const nuevoId = empleados.length ? Math.max(...empleados.map(empleado => Number(empleado.id))) + 1 : 1
      setEmpleados(actuales => [...actuales, { id: nuevoId, ...datos }])
    }
    setMostrarModalEmpleado(false)
    setEmpleadoEnEdicion(null)
    setFormularioEmpleado({ nombre: '', apellido: '', documento: '', fechaIngreso: '', cargo_id_cargo: cargos[0] ? String(cargos[0].id_cargo) : '', hotel_id_hotel: hoteles[0] ? String(hoteles[0].id_hotel) : '' })
    setErrorEmpleado('')
  }

  // ==========================================
  // CRUD DE CARGOS
  // ==========================================

  function abrirRegistroCargo() {
    if (employeeSession) return
    setCargoEnEdicion(null)
    setFormularioCargo({ nombre: '', salario_base: '' })
    setErrorCargo('')
    setMostrarModalCargo(true)
  }

  function abrirEdicionCargo(cargo) {
    if (employeeSession) return
    setCargoEnEdicion(cargo)
    setFormularioCargo({ nombre: cargo.nombre, salario_base: cargo.salario_base == null ? '' : String(cargo.salario_base) })
    setErrorCargo('')
    setMostrarModalCargo(true)
  }

  function guardarCargo(evento) {
    evento.preventDefault()
    if (employeeSession) return
    const nombre = formularioCargo.nombre.trim()
    const salario = formularioCargo.salario_base.trim() === '' ? null : Number(formularioCargo.salario_base)

    if (!nombre) { setErrorCargo('Ingresa el nombre del cargo.'); return }
    if (nombre.length > 100) { setErrorCargo('El nombre no puede superar los 100 caracteres.'); return }
    if (salario !== null && (!Number.isFinite(salario) || salario < 0 || !/^\d+(\.\d{1,2})?$/.test(formularioCargo.salario_base.trim()))) {
      setErrorCargo('Ingresa un salario válido, con máximo dos decimales.'); return
    }
    const nombreDuplicado = cargos.some(cargo => cargo.id_cargo !== cargoEnEdicion?.id_cargo && cargo.nombre.trim().toLowerCase() === nombre.toLowerCase())
    if (nombreDuplicado) { setErrorCargo('Ya existe un cargo registrado con ese nombre.'); return }

    if (cargoEnEdicion) {
      setCargos(actuales => actuales.map(cargo => cargo.id_cargo === cargoEnEdicion.id_cargo ? { ...cargo, nombre, salario_base: salario } : cargo))
    } else {
      const nuevoId = cargos.length ? Math.max(...cargos.map(cargo => Number(cargo.id_cargo))) + 1 : 1
      setCargos(actuales => [...actuales, { id_cargo: nuevoId, nombre, salario_base: salario }])
    }
    setMostrarModalCargo(false)
    setCargoEnEdicion(null)
    setFormularioCargo({ nombre: '', salario_base: '' })
    setErrorCargo('')
  }

  function confirmarEliminarCargo() {
    if (!puedeEliminarEnModulo()) return
    if (!cargoPorEliminar) return
    const estaAsignado = empleados.some(empleado => Number(empleado.cargo_id_cargo) === Number(cargoPorEliminar.id_cargo))
    if (estaAsignado) return
    setCargos(actuales => actuales.filter(cargo => cargo.id_cargo !== cargoPorEliminar.id_cargo))
    setCargoPorEliminar(null)
  }

  const cargosFiltrados = cargos.filter(cargo =>
    `${cargo.nombre} ${cargo.id_cargo}`.toLowerCase().includes(busquedaCargo.toLowerCase().trim())
      && coincideFiltrosAvanzadosLista(cargo, 'cargos', atributosFiltroCargos)
  )

  function confirmarEliminarEmpleado() {
    if (!puedeEliminarEnModulo()) return
    if (!empleadoPorEliminar) return
    const estadiasAsociadas = estadias.some(
      estadia => Number(estadia.empleado_id_empleado) === Number(empleadoPorEliminar.id)
    )
    const mantenimientosAsociados = mantenimientos.some(
      mantenimiento => Number(mantenimiento.empleado_id_empleado) === Number(empleadoPorEliminar.id)
    )
    if (estadiasAsociadas || mantenimientosAsociados) return
    setEmpleados(actuales => actuales.filter(empleado => empleado.id !== empleadoPorEliminar.id))
    setEmpleadoPorEliminar(null)
  }

  const empleadosFiltrados = empleados.filter(empleado => {
    const texto = busquedaEmpleado.toLowerCase().trim()
    const nombreCompleto = `${empleado.nombre} ${empleado.apellido}`.toLowerCase()
    const cargo = obtenerCargoEmpleado(empleado)
    const coincideTexto = nombreCompleto.includes(texto) || empleado.documento.toLowerCase().includes(texto) || (cargo?.nombre || '').toLowerCase().includes(texto)
    return coincideTexto && coincideFiltrosAvanzadosLista(empleado, 'empleados', atributosFiltroEmpleados)
  })

  // ==========================================
  // CRUD DE SERVICIOS
  // ==========================================

  function abrirRegistroServicio() {
    if (!puedeCrearEnModulo('Servicios')) return
    setServicioEnEdicion(null)
    setFormularioServicio({ nombre: '', precio: '', hotel_id_hotel: hoteles[0] ? String(hoteles[0].id_hotel) : '' })
    setErrorServicio('')
    setMostrarModalServicio(true)
  }

  function abrirEdicionServicio(servicio) {
    if (!puedeEditarEnModulo('Servicios') || !serviciosVisibles.some(item => Number(item.id) === Number(servicio.id))) return
    setServicioEnEdicion(servicio)
    setFormularioServicio({ nombre: servicio.nombre, precio: String(servicio.precio), hotel_id_hotel: String(servicio.hotel_id_hotel ?? '') })
    setErrorServicio('')
    setMostrarModalServicio(true)
  }

  function guardarServicio(evento) {
    evento.preventDefault()
    if (servicioEnEdicion ? !puedeEditarEnModulo('Servicios') : !puedeCrearEnModulo('Servicios')) return
    const nombre = formularioServicio.nombre.trim()
    const precioTexto = formularioServicio.precio.trim()
    const precio = Number(precioTexto)
    const hotelId = Number(formularioServicio.hotel_id_hotel)
    if (!nombre) { setErrorServicio('Ingresa el nombre del servicio.'); return }
    if (nombre.length > 100) { setErrorServicio('El nombre no puede superar los 100 caracteres.'); return }
    if (!formularioServicio.hotel_id_hotel || (employeeSession ? hotelId !== hotelSesionId : !hoteles.some(hotel => Number(hotel.id_hotel) === hotelId))) {
      setErrorServicio('Selecciona un hotel existente.')
      return
    }
    if (!precioTexto || !Number.isFinite(precio) || precio < 0 || !/^\d+(\.\d{1,2})?$/.test(precioTexto)) {
      setErrorServicio('Ingresa un precio válido, mayor o igual a cero y con máximo dos decimales.'); return
    }
    const nombreDuplicado = servicios.some(servicio => servicio.id !== servicioEnEdicion?.id && servicio.nombre.trim().toLowerCase() === nombre.toLowerCase())
    if (nombreDuplicado) { setErrorServicio('Ya existe un servicio registrado con ese nombre.'); return }
    if (servicioEnEdicion) {
      setServicios(actuales => actuales.map(servicio => servicio.id === servicioEnEdicion.id ? { ...servicio, hotel_id_hotel: hotelId, nombre, precio } : servicio))
    } else {
      const nuevoId = servicios.length ? Math.max(...servicios.map(servicio => Number(servicio.id))) + 1 : 1
      setServicios(actuales => [...actuales, { id: nuevoId, hotel_id_hotel: hotelId, nombre, precio }])
    }
    setMostrarModalServicio(false)
    setServicioEnEdicion(null)
    setFormularioServicio({ nombre: '', precio: '', hotel_id_hotel: hoteles[0] ? String(hoteles[0].id_hotel) : '' })
    setErrorServicio('')
  }

  function obtenerConsumosServicio(servicio) {
    return consumosVisibles.filter(consumo => Number(consumo.servicio_id_servicio) === Number(servicio.id))
  }

  function confirmarEliminarServicio() {
    if (!puedeEliminarEnModulo()) return
    if (!servicioPorEliminar) return
    const consumosRelacionados = obtenerConsumosServicio(servicioPorEliminar)
    if (consumosRelacionados.length > 0) return
    setServicios(actuales => actuales.filter(servicio => servicio.id !== servicioPorEliminar.id))
    setServicioPorEliminar(null)
  }

  // ==========================================
  // FILTRAR SERVICIOS
  // ==========================================

  const serviciosFiltrados = serviciosVisibles.filter((servicio) => {
    const texto = busquedaServicio.toLowerCase()
    return servicio.nombre.toLowerCase().includes(texto)
      && coincideFiltrosAvanzadosLista(servicio, 'servicios', atributosFiltroServicios)
  })

  // ==========================================
  // CRUD DE CONSUMO_SERVICIO
  // ==========================================

  function abrirRegistroConsumo() {
    if (!puedeCrearEnModulo('Consumos')) return
    setConsumoEnEdicion(null)
    setFormularioConsumo({ estadia_id_estadia: '', servicio_id_servicio: '', cantidad: '1', subtotal: '' })
    setErrorConsumo('')
    setMostrarModalConsumo(true)
  }

  function abrirEdicionConsumo(consumo) {
    if (!puedeEditarEnModulo('Consumos') || !consumosVisibles.some(item => Number(item.id_consumo) === Number(consumo.id_consumo))) return
    setConsumoEnEdicion(consumo)
    setFormularioConsumo({
      estadia_id_estadia: String(consumo.estadia_id_estadia),
      servicio_id_servicio: String(consumo.servicio_id_servicio),
      cantidad: String(consumo.cantidad),
      subtotal: String(consumo.subtotal),
    })
    setErrorConsumo('')
    setMostrarModalConsumo(true)
  }

  function guardarConsumo(evento) {
    evento.preventDefault()
    if (consumoEnEdicion ? !puedeEditarEnModulo('Consumos') : !puedeCrearEnModulo('Consumos')) return
    const estadiaId = Number(formularioConsumo.estadia_id_estadia)
    const servicioId = Number(formularioConsumo.servicio_id_servicio)
    const cantidadTexto = formularioConsumo.cantidad.trim()
    const subtotalTexto = formularioConsumo.subtotal.trim()
    const cantidad = Number(cantidadTexto)
    const subtotal = Number(subtotalTexto)

    if (!estadiasVisibles.some(estadia => Number(estadia.id_estadia) === estadiaId)) {
      setErrorConsumo('Selecciona una estadía válida. No hay registros de ESTADIA disponibles en el sistema.')
      return
    }
    if (!serviciosVisibles.some(servicio => Number(servicio.id) === servicioId)) {
      setErrorConsumo('Selecciona un servicio válido.')
      return
    }
    if (!cantidadTexto || !Number.isInteger(cantidad) || cantidad <= 0) {
      setErrorConsumo('La cantidad debe ser un número entero mayor que cero.')
      return
    }
    if (!subtotalTexto || !Number.isFinite(subtotal) || subtotal < 0 || !/^\d+(\.\d{1,2})?$/.test(subtotalTexto)) {
      setErrorConsumo('Ingresa un subtotal válido, mayor o igual a cero y con máximo dos decimales.')
      return
    }

    if (consumoEnEdicion) {
      setConsumosServicios(actuales => actuales.map(consumo => consumo.id_consumo === consumoEnEdicion.id_consumo
        ? { ...consumo, estadia_id_estadia: estadiaId, servicio_id_servicio: servicioId, cantidad, subtotal }
        : consumo))
    } else {
      const nuevoId = consumosServicios.length ? Math.max(...consumosServicios.map(consumo => Number(consumo.id_consumo))) + 1 : 1
      setConsumosServicios(actuales => [...actuales, { id_consumo: nuevoId, estadia_id_estadia: estadiaId, servicio_id_servicio: servicioId, cantidad, subtotal }])
    }
    setMostrarModalConsumo(false)
    setConsumoEnEdicion(null)
    setErrorConsumo('')
  }

  function confirmarEliminarConsumo() {
    if (!puedeEliminarEnModulo()) return
    if (!consumoPorEliminar) return
    setConsumosServicios(actuales => actuales.filter(consumo => consumo.id_consumo !== consumoPorEliminar.id_consumo))
    setConsumoPorEliminar(null)
  }

  const consumosFiltrados = consumosVisibles.filter(consumo => {
    const servicio = serviciosVisibles.find(item => Number(item.id) === Number(consumo.servicio_id_servicio))
    const texto = busquedaConsumo.toLowerCase().trim()
    const coincideTexto = String(consumo.id_consumo).includes(texto)
      || String(consumo.estadia_id_estadia).includes(texto)
      || String(consumo.servicio_id_servicio).includes(texto)
      || String(consumo.cantidad).includes(texto)
      || String(consumo.subtotal).includes(texto)
      || (servicio?.nombre || '').toLowerCase().includes(texto)
    return coincideTexto && coincideFiltrosAvanzadosLista(consumo, 'consumos', atributosFiltroConsumos)
  })

  // ==========================================
  // GESTIÓN Y FILTRO DE PAGOS
  // ==========================================

  const obtenerEstadiaPago = (pago) =>
    estadiasVisibles.find(estadia => Number(estadia.id_estadia) === Number(pago.estadia_id_estadia))

  const obtenerReservaPago = (pago) => {
    const estadia = obtenerEstadiaPago(pago)
    return estadia ? obtenerReservaEstadia(estadia) : null
  }

  function abrirRegistroPago() {
    if (!puedeCrearEnModulo('Pagos')) return
    setPagoEnEdicion(null)
    setFormularioPago({ estadia_id_estadia: '', fecha_pago: new Date().toISOString().slice(0, 10), monto: '', metodo_pago: '' })
    setErrorPago('')
    setMostrarModalPago(true)
  }

  function abrirEdicionPago(pago) {
    if (!puedeEditarEnModulo('Pagos') || !pagosVisibles.some(item => Number(item.id_pago) === Number(pago.id_pago))) return
    setPagoEnEdicion(pago)
    setFormularioPago({ estadia_id_estadia: String(pago.estadia_id_estadia), fecha_pago: pago.fecha_pago, monto: String(pago.monto), metodo_pago: pago.metodo_pago })
    setErrorPago('')
    setMostrarModalPago(true)
  }

  function guardarPago(evento) {
    evento.preventDefault()
    if (pagoEnEdicion ? !puedeEditarEnModulo('Pagos') : !puedeCrearEnModulo('Pagos')) return
    const estadiaId = Number(formularioPago.estadia_id_estadia)
    const montoTexto = formularioPago.monto.trim()
    const monto = Number(montoTexto)
    if (!estadiasVisibles.some(item => Number(item.id_estadia) === estadiaId)) { setErrorPago('Selecciona una estadía existente para mantener la clave foránea.'); return }
    if (!formularioPago.fecha_pago) { setErrorPago('Selecciona la fecha del pago.'); return }
    if (!montoTexto || !Number.isFinite(monto) || monto <= 0 || !/^\d+(\.\d{1,2})?$/.test(montoTexto)) { setErrorPago('El monto debe ser mayor que cero y tener como máximo dos decimales.'); return }
    if (!formularioPago.metodo_pago.trim() || formularioPago.metodo_pago.trim().length > 50) { setErrorPago('Ingresa un método de pago de hasta 50 caracteres.'); return }
    const datos = { estadia_id_estadia: estadiaId, fecha_pago: formularioPago.fecha_pago, monto, metodo_pago: formularioPago.metodo_pago.trim() }
    if (pagoEnEdicion) setPagos(actuales => actuales.map(item => item.id_pago === pagoEnEdicion.id_pago ? { ...item, ...datos } : item))
    else { const nuevoId = pagos.length ? Math.max(...pagos.map(item => Number(item.id_pago))) + 1 : 1; setPagos(actuales => [...actuales, { id_pago: nuevoId, ...datos }]) }
    setMostrarModalPago(false); setPagoEnEdicion(null); setErrorPago('')
  }

  function confirmarEliminarPago() {
    if (!puedeEliminarEnModulo()) return
    if (!pagoPorEliminar) return
    setPagos(actuales => actuales.filter(item => item.id_pago !== pagoPorEliminar.id_pago))
    setPagoPorEliminar(null)
  }

  const pagosFiltrados = pagosVisibles.filter(pago => {
    const texto = busquedaPago.trim().toLowerCase()
    const reserva = obtenerReservaPago(pago)
    const cliente = reserva ? nombreClienteReserva(reserva) : ''
    const coincideBusqueda = String(pago.id_pago).includes(texto) || String(pago.estadia_id_estadia).includes(texto) || pago.fecha_pago.includes(texto) || pago.metodo_pago.toLowerCase().includes(texto) || cliente.toLowerCase().includes(texto)
    return coincideBusqueda && coincideFiltrosAvanzadosLista(pago, 'pagos', atributosFiltroPagos)
  })

  // ==========================================
  // FILTRAR MANTENIMIENTOS
  // ==========================================

  const obtenerHabitacionMantenimiento = mantenimiento =>
    habitacionesVisibles.find(habitacion => Number(habitacion.id) === Number(mantenimiento.habitacion_id_habitacion))

  const obtenerEmpleadoMantenimiento = mantenimiento =>
    empleadosDelHotel.find(empleado => Number(empleado.id) === Number(mantenimiento.empleado_id_empleado))

  function abrirRegistroMantenimiento() {
    if (!puedeCrearEnModulo('Mantenimiento')) return
    if (!habitacionesVisibles.length || !empleadosDelHotel.length) return
    setMantenimientoEnEdicion(null)
    setFormularioMantenimiento({ fecha_inicio: new Date().toISOString().slice(0, 10), tipo: '', costo: '', habitacion_id_habitacion: '', empleado_id_empleado: '' })
    setErrorMantenimiento('')
    setMostrarModalMantenimiento(true)
  }

  function abrirEdicionMantenimiento(mantenimiento) {
    if (!puedeEditarEnModulo('Mantenimiento') || !mantenimientosVisibles.some(item => Number(item.id_mantenimiento) === Number(mantenimiento.id_mantenimiento))) return
    setMantenimientoEnEdicion(mantenimiento)
    setFormularioMantenimiento({
      fecha_inicio: mantenimiento.fecha_inicio,
      tipo: mantenimiento.tipo,
      costo: String(mantenimiento.costo),
      habitacion_id_habitacion: String(mantenimiento.habitacion_id_habitacion),
      empleado_id_empleado: String(mantenimiento.empleado_id_empleado),
    })
    setErrorMantenimiento('')
    setMostrarModalMantenimiento(true)
  }

  function guardarMantenimiento(evento) {
    evento.preventDefault()
    if (mantenimientoEnEdicion
      ? !puedeEditarEnModulo('Mantenimiento') || !mantenimientosVisibles.some(item => Number(item.id_mantenimiento) === Number(mantenimientoEnEdicion.id_mantenimiento))
      : !puedeCrearEnModulo('Mantenimiento')) return
    const tipo = formularioMantenimiento.tipo.trim()
    const costoTexto = formularioMantenimiento.costo.trim()
    const costo = Number(costoTexto)
    const habitacionId = Number(formularioMantenimiento.habitacion_id_habitacion)
    const empleadoId = Number(formularioMantenimiento.empleado_id_empleado)
    const habitacionExiste = habitacionesVisibles.some(habitacion => Number(habitacion.id) === habitacionId)
    const empleadoExiste = empleadosDelHotel.some(empleado => Number(empleado.id) === empleadoId)
    const fecha = new Date(`${formularioMantenimiento.fecha_inicio}T00:00:00`)
    const fechaValida = Boolean(formularioMantenimiento.fecha_inicio)
      && !Number.isNaN(fecha.getTime())
      && fecha.toISOString().slice(0, 10) === formularioMantenimiento.fecha_inicio

    if (!fechaValida) { setErrorMantenimiento('Selecciona una fecha de inicio válida.'); return }
    if (!tipo) { setErrorMantenimiento('Ingresa el tipo de mantenimiento.'); return }
    if (tipo.length > 20) { setErrorMantenimiento('El tipo no puede superar los 20 caracteres.'); return }
    if (!costoTexto || !Number.isFinite(costo) || costo < 0 || !/^\d{1,8}(\.\d{1,2})?$/.test(costoTexto)) {
      setErrorMantenimiento('Ingresa un costo numérico no negativo, con hasta 8 dígitos enteros y 2 decimales.')
      return
    }
    if (!habitacionExiste) { setErrorMantenimiento('Selecciona una habitación existente.'); return }
    if (!empleadoExiste) { setErrorMantenimiento('Selecciona un empleado existente.'); return }

    const datos = {
      habitacion_id_habitacion: habitacionId,
      empleado_id_empleado: empleadoId,
      fecha_inicio: formularioMantenimiento.fecha_inicio,
      tipo,
      costo,
    }
    if (mantenimientoEnEdicion) {
      setMantenimientos(actuales => actuales.map(item => item.id_mantenimiento === mantenimientoEnEdicion.id_mantenimiento
        ? { ...item, ...datos }
        : item))
    } else {
      const nuevoId = mantenimientos.length ? Math.max(...mantenimientos.map(item => Number(item.id_mantenimiento))) + 1 : 1
      setMantenimientos(actuales => [...actuales, { id_mantenimiento: nuevoId, ...datos }])
    }
    setMostrarModalMantenimiento(false)
    setMantenimientoEnEdicion(null)
    setErrorMantenimiento('')
  }

  function confirmarEliminarMantenimiento() {
    if (!puedeEliminarEnModulo()) return
    if (!mantenimientoPorEliminar) return
    setMantenimientos(actuales => actuales.filter(item => item.id_mantenimiento !== mantenimientoPorEliminar.id_mantenimiento))
    setMantenimientoSeleccionado(actual => actual?.id_mantenimiento === mantenimientoPorEliminar.id_mantenimiento ? null : actual)
    setMantenimientoPorEliminar(null)
  }

  const mantenimientosFiltrados = mantenimientosVisibles.filter(mantenimiento => {
    const texto = busquedaMantenimiento.trim().toLowerCase()
    const habitacion = obtenerHabitacionMantenimiento(mantenimiento)
    const empleado = obtenerEmpleadoMantenimiento(mantenimiento)
    const nombreEmpleado = empleado ? `${empleado.nombre} ${empleado.apellido}` : ''
    const coincideTexto = String(mantenimiento.id_mantenimiento).includes(texto)
      || String(mantenimiento.fecha_inicio).toLowerCase().includes(texto)
      || mantenimiento.tipo.toLowerCase().includes(texto)
      || String(mantenimiento.costo).includes(texto)
      || String(habitacion?.numero || '').toLowerCase().includes(texto)
      || nombreEmpleado.toLowerCase().includes(texto)
    return coincideTexto && coincideFiltrosAvanzadosLista(mantenimiento, 'mantenimientos', atributosFiltroMantenimiento)
  })

  const hotelesPagina = prepararPaginaLista('hoteles', hotelesFiltrados, {
    id_hotel: hotel => hotel.id_hotel, nombre: hotel => hotel.nombre, direccion: hotel => hotel.direccion,
    ciudad: hotel => hotel.ciudad, pais: hotel => hotel.pais, telefono: hotel => hotel.telefono,
    email: hotel => hotel.email, categoria: hotel => hotel.categoria,
  })
  const tiposHabitacionPagina = prepararPaginaLista('tipos', tiposHabitacionFiltrados, {
    id: tipo => tipo.id_tipo, nombre: tipo => tipo.nombre, descripcion: tipo => tipo.descripcion, capacidad: tipo => tipo.capacidad, precio: tipo => tipo.precio_base,
  })
  const habitacionesPagina = prepararPaginaLista('habitaciones', habitacionesFiltradas, {
    id: habitacion => habitacion.id, numero: habitacion => habitacion.numero, tipo: habitacion => nombreTipoHabitacion(habitacion), piso: habitacion => habitacion.piso, estado: habitacion => habitacion.estado,
  })
  const reservasPagina = prepararPaginaLista('reservas', reservasFiltradas, {
    id: reserva => reserva.id_reserva, registro: reserva => reserva.fecha_reserva,
    entrada: reserva => reserva.fecha_entrada, salida: reserva => reserva.fecha_salida, estado: reserva => reserva.estado,
    total: reserva => reserva.total_estimado, adelanto: reserva => reserva.monto_adelanto,
  })
  const estadiasPagina = prepararPaginaLista('estadias', estadiasFiltradas, {
    id: estadia => estadia.id_estadia, entrada: estadia => estadia.fecha_check_in, salida: estadia => estadia.fecha_check_out,
  })
  const clientesPagina = prepararPaginaLista('clientes', clientesFiltrados, {
    id: cliente => cliente.id, nombre: cliente => cliente.nombre, apellido: cliente => cliente.apellido,
    documento: cliente => cliente.documento, correo: cliente => cliente.email, nacionalidad: cliente => cliente.nacionalidad,
  })
  const empleadosPagina = prepararPaginaLista('empleados', empleadosFiltrados, {
    id: empleado => empleado.id, nombre: empleado => empleado.nombre, apellido: empleado => empleado.apellido,
    documento: empleado => empleado.documento, ingreso: empleado => empleado.fechaIngreso,
  })
  const cargosPagina = prepararPaginaLista('cargos', cargosFiltrados, {
    id: cargo => cargo.id_cargo, nombre: cargo => cargo.nombre, salario: cargo => cargo.salario_base,
  })
  const serviciosPagina = prepararPaginaLista('servicios', serviciosFiltrados, {
    id: servicio => servicio.id, nombre: servicio => servicio.nombre, precio: servicio => servicio.precio,
  })
  const consumosPagina = prepararPaginaLista('consumos', consumosFiltrados, {
    id: consumo => consumo.id_consumo, cantidad: consumo => consumo.cantidad, subtotal: consumo => consumo.subtotal,
  })
  const pagosPagina = prepararPaginaLista('pagos', pagosFiltrados, {
    id: pago => pago.id_pago, fecha: pago => pago.fecha_pago, monto: pago => pago.monto,
    metodo: pago => pago.metodo_pago, estadia: pago => pago.estadia_id_estadia,
  })
  const mantenimientosPagina = prepararPaginaLista('mantenimientos', mantenimientosFiltrados, {
    id: mantenimiento => mantenimiento.id_mantenimiento, fecha: mantenimiento => mantenimiento.fecha_inicio,
    tipo: mantenimiento => mantenimiento.tipo, costo: mantenimiento => mantenimiento.costo,
    habitacion: mantenimiento => obtenerHabitacionMantenimiento(mantenimiento)?.numero,
    empleado: mantenimiento => { const empleado = obtenerEmpleadoMantenimiento(mantenimiento); return empleado ? `${empleado.nombre} ${empleado.apellido}` : '' },
  })

  // ==========================================
  // MOSTRAR CONTENIDO SEGUN EL MODULO
  // ==========================================

  function mostrarContenido() {

    if (employeeSession && !puedeVerModulo(seccionActiva)) {
      return <section className="welcome"><h1>Acceso restringido</h1><p>Este módulo no está habilitado para tu cargo.</p></section>
    }

    // ========================================
    // MODULO HABITACIONES
    // ========================================

    if (seccionActiva === 'Habitaciones') {
      return (
        <section className="rooms-section rooms-modern-section">
          <div className="reservations-heading">
            <div className="welcome">
              <span className="reservations-eyebrow">GESTIÓN HOTELERA</span>
              <h1>Gestión de habitaciones</h1>
              <p>{employeeSession ? `Consulta las habitaciones de ${employeeSession.hotel.nombre}.` : 'Consulta y administra las habitaciones de Hotel Los Andes.'}</p>
            </div>
            <div className="rooms-heading-actions">
              <div className="reservations-heading-note">
                <span className="reservations-note-icon">▦</span>
                <div><strong>{habitacionesVisibles.length} registros</strong><span>Habitaciones en el sistema</span></div>
              </div>
            </div>
          </div>

          <div className="rooms-subnav" role="tablist" aria-label="Secciones de habitaciones">
            <button type="button" role="tab" aria-selected={subseccionHabitaciones === 'habitaciones'} className={subseccionHabitaciones === 'habitaciones' ? 'active' : ''} onClick={() => setSubseccionHabitaciones('habitaciones')}>Habitaciones</button>
            {puedeVerModulo('Tipos de habitación') && <button type="button" role="tab" aria-selected={subseccionHabitaciones === 'tipos'} className={subseccionHabitaciones === 'tipos' ? 'active' : ''} onClick={() => setSubseccionHabitaciones('tipos')}>Tipos de habitación</button>}
          </div>

          {(subseccionHabitaciones === 'habitaciones' || (subseccionHabitaciones === 'tipos' && !puedeVerModulo('Tipos de habitación'))) && <>
          <div className="room-summary rooms-modern-summary">
            <article className="room-summary-card reservation-stat reservation-stat-total">
              <div className="reservation-stat-top"><span>Total de habitaciones</span><span className="reservation-stat-icon">▤</span></div>
              <h2>{habitacionesVisibles.length}</h2><small>Habitaciones registradas</small>
            </article>
            <article className="room-summary-card reservation-stat rooms-stat-available">
              <div className="reservation-stat-top"><span>Disponibles</span><span className="reservation-stat-icon">✓</span></div>
              <h2>{habitacionesVisibles.filter(h => h.estado === 'DISPONIBLE').length}</h2><small>Listas para reservar</small>
            </article>
            <article className="room-summary-card reservation-stat rooms-stat-occupied">
              <div className="reservation-stat-top"><span>Ocupadas</span><span className="reservation-stat-icon">▣</span></div>
              <h2>{habitacionesVisibles.filter(h => h.estado === 'OCUPADA').length}</h2><small>Con huéspedes alojados</small>
            </article>
            <article className="room-summary-card reservation-stat rooms-stat-maintenance">
              <div className="reservation-stat-top"><span>En mantenimiento</span><span className="reservation-stat-icon">⚒</span></div>
              <h2>{habitacionesVisibles.filter(h => h.estado === 'MANTENIMIENTO').length}</h2><small>No disponibles temporalmente</small>
            </article>
          </div>

          <div className="room-list reservations-list rooms-modern-list">
            <div className="room-list-header reservations-list-header">
              <div><h2>Listado de habitaciones</h2><p>Consulta el número, tipo, piso y estado de cada habitación.</p></div>
              <div className="reservations-header-actions">
                <span className="reservations-total-pill">{habitacionesFiltradas.length} resultados</span>
                {puedeCrearEnModulo('Habitaciones') && <button type="button" className="reservation-new-button" onClick={abrirRegistroHabitacion}>＋ Nueva habitación</button>}
              </div>
            </div>

            <DynamicListFilterPanel title="Habitaciones" listKey="habitaciones" searchValue={busqueda} searchPlaceholder="Buscar por número o piso..." attributes={atributosFiltroHabitaciones} activeFilters={obtenerFiltrosActivosLista('habitaciones')} onSearchChange={valor => actualizarFiltroLista('habitaciones', setBusqueda, valor)} onAddFilter={agregarFiltroAvanzadoLista} onRemoveFilter={quitarFiltroAvanzadoLista} onClearFilters={lista => { setBusqueda(''); limpiarFiltrosAvanzadosLista(lista) }} />            <div className="table-container reservations-table-container rooms-modern-table-container">
              <table className="rooms-table rooms-modern-table">
                <thead>
                  <tr><SortableHeader field='numero' list='habitaciones' label='NÚMERO' sort={ordenesLista['habitaciones']} onSort={campo => alternarOrdenLista('habitaciones', campo)} /><SortableHeader field='tipo' list='habitaciones' label='TIPO DE HABITACIÓN' sort={ordenesLista['habitaciones']} onSort={campo => alternarOrdenLista('habitaciones', campo)} /><SortableHeader field='piso' list='habitaciones' label='PISO' sort={ordenesLista['habitaciones']} onSort={campo => alternarOrdenLista('habitaciones', campo)} /><SortableHeader field='estado' list='habitaciones' label='ESTADO' sort={ordenesLista['habitaciones']} onSort={campo => alternarOrdenLista('habitaciones', campo)} /><th className="reservation-action-heading">ACCIONES</th></tr>
                </thead>
                <tbody>
                  {habitacionesPagina.rows.map((habitacion) => (
                    <tr key={habitacion.id}>
                      <td><span className="room-number-code">{habitacion.numero}</span></td>
                      <td><span className="room-type-label">{nombreTipoHabitacion(habitacion)}</span></td>
                      <td>{habitacion.piso}</td>
                      <td><span className={`room-status room-status-modern ${habitacion.estado.toLowerCase()}`}><span className="room-status-dot" />{habitacion.estado}</span></td>
                      <td className="reservation-action-cell"><div className="reservation-row-actions"><button type="button" className="reservation-detail-button" onClick={() => setHabitacionSeleccionada(habitacion)} aria-label={`Ver detalle de la habitación ${habitacion.numero}`}>Ver detalle</button><button type="button" className="reservation-edit-button" hidden={!puedeEditarEnModulo('Habitaciones')} onClick={() => abrirEdicionHabitacion(habitacion)} aria-label={`Editar la habitación ${habitacion.numero}`}>Editar</button><button type="button" className="reservation-cancel-record-button" hidden={!puedeEliminarEnModulo()} onClick={() => abrirConfirmacionEliminarHabitacion(habitacion)} aria-label={`Eliminar la habitación ${habitacion.numero}`}>Eliminar</button></div></td>
                    </tr>
                  ))}
                  {habitacionesFiltradas.length === 0 && (
                    <tr><td colSpan="5" className="empty-message">No se encontraron habitaciones con esos criterios.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="reservations-list-footer"><span>Mostrando {habitacionesFiltradas.length} de {habitacionesVisibles.length} habitaciones</span><span>Datos temporales estructurados según el modelo relacional</span></div>
              <ListPagination totalItems={habitacionesFiltradas.length} {...habitacionesPagina} onPageChange={pagina => cambiarPaginaLista('habitaciones', pagina)} onPageSizeChange={tamano => cambiarTamanoPaginaLista('habitaciones', tamano)} />
          </div>
          </>}

          {subseccionHabitaciones === 'tipos' && puedeVerModulo('Tipos de habitación') && <>
            <div className="room-summary rooms-modern-summary types-room-summary">
                <article className="room-summary-card reservation-stat reservation-stat-total"><div className="reservation-stat-top"><span>Tipos registrados</span><span className="reservation-stat-icon">▤</span></div><h2>{tiposHabitacion.length}</h2><small>Registros en TIPO_HABITACION</small></article>
                <article className="room-summary-card reservation-stat rooms-stat-available"><div className="reservation-stat-top"><span>Tipos en uso</span><span className="reservation-stat-icon">⌂</span></div><h2>{tiposHabitacion.filter(tipo => habitaciones.some(habitacion => Number(habitacion.tipo_habitacion_id_tipo) === Number(tipo.id_tipo))).length}</h2><small>Con habitaciones relacionadas</small></article>
                <article className="room-summary-card reservation-stat rooms-stat-occupied"><div className="reservation-stat-top"><span>Habitaciones relacionadas</span><span className="reservation-stat-icon">▦</span></div><h2>{habitacionesVisibles.filter(habitacion => tiposHabitacion.some(tipo => Number(tipo.id_tipo) === Number(habitacion.tipo_habitacion_id_tipo))).length}</h2><small>Habitaciones con tipo existente</small></article>
                <article className="room-summary-card reservation-stat rooms-stat-maintenance"><div className="reservation-stat-top"><span>Capacidad máxima</span><span className="reservation-stat-icon">♙</span></div><h2>{tiposHabitacion.length ? Math.max(...tiposHabitacion.map(tipo => Number(tipo.capacidad) || 0)) : 0}</h2><small>Personas según tipo registrado</small></article>
              </div>
            <div className="room-list reservations-list rooms-modern-list type-room-list">
              <div className="room-list-header reservations-list-header">
                <div><h2>Tipos de habitación</h2><p>Administra las categorías, capacidad y precio base de las habitaciones.</p></div>
                <div className="reservations-header-actions"><span className="reservations-total-pill">{tiposHabitacionFiltrados.length} resultados</span>{puedeCrearEnModulo('Tipos de habitación') && <button type="button" className="reservation-new-button" onClick={abrirRegistroTipo}>＋ Nuevo tipo</button>}</div>
              </div>
              <DynamicListFilterPanel title="Tipos de habitación" listKey="tipos" searchValue={busquedaTipo} searchPlaceholder="Buscar por nombre o descripción..." attributes={atributosFiltroTiposHabitacion} activeFilters={obtenerFiltrosActivosLista('tipos')} onSearchChange={valor => actualizarFiltroLista('tipos', setBusquedaTipo, valor)} onAddFilter={agregarFiltroAvanzadoLista} onRemoveFilter={quitarFiltroAvanzadoLista} onClearFilters={lista => { setBusquedaTipo(''); limpiarFiltrosAvanzadosLista(lista) }} />
<div className="table-container reservations-table-container rooms-modern-table-container">
                <table className="rooms-table types-room-table"><thead><tr><SortableHeader field='id' list='tipos' label='ID' sort={ordenesLista['tipos']} onSort={campo => alternarOrdenLista('tipos', campo)} /><SortableHeader field='nombre' list='tipos' label='NOMBRE DEL TIPO' sort={ordenesLista['tipos']} onSort={campo => alternarOrdenLista('tipos', campo)} /><SortableHeader field='descripcion' list='tipos' label='DESCRIPCIÓN' sort={ordenesLista['tipos']} onSort={campo => alternarOrdenLista('tipos', campo)} /><SortableHeader field='capacidad' list='tipos' label='CAPACIDAD' sort={ordenesLista['tipos']} onSort={campo => alternarOrdenLista('tipos', campo)} /><SortableHeader field='precio' list='tipos' label='PRECIO BASE' sort={ordenesLista['tipos']} onSort={campo => alternarOrdenLista('tipos', campo)} /><th className="reservation-action-heading">ACCIONES</th></tr></thead>
                  <tbody>{tiposHabitacionPagina.rows.map(tipo => <tr key={tipo.id_tipo}><td>{tipo.id_tipo}</td><td><span className="room-type-label">{tipo.nombre}</span></td><td>{tipo.descripcion || '—'}</td><td>{tipo.capacidad} persona(s)</td><td>{tipo.precio_base == null ? 'No registrado' : `S/ ${Number(tipo.precio_base).toFixed(2)}`}</td><td className="reservation-action-cell"><div className="reservation-row-actions"><button type="button" className="reservation-detail-button" onClick={() => setTipoSeleccionado(tipo)}>Ver detalle</button><button type="button" className="reservation-edit-button" hidden={!puedeEditarEnModulo('Tipos de habitación')} onClick={() => abrirEdicionTipo(tipo)}>Editar</button><button type="button" className="reservation-cancel-record-button" hidden={!puedeEliminarEnModulo()} onClick={() => setTipoPorEliminar(tipo)}>Eliminar</button></div></td></tr>
                  )}{tiposHabitacionFiltrados.length === 0 && <tr><td colSpan="6" className="empty-message">No se encontraron tipos de habitación.</td></tr>}</tbody>
                </table>
              </div>
              <div className="reservations-list-footer"><span>Mostrando {tiposHabitacionFiltrados.length} de {tiposHabitacion.length} tipos</span><span>Tabla TIPO_HABITACION del modelo relacional</span></div>
              <ListPagination totalItems={tiposHabitacionFiltrados.length} {...tiposHabitacionPagina} onPageChange={pagina => cambiarPaginaLista('tipos', pagina)} onPageSizeChange={tamano => cambiarTamanoPaginaLista('tipos', tamano)} />
            </div>
          </>}

          {mostrarModalTipo && (tipoEnEdicion ? puedeEditarEnModulo('Tipos de habitación') : puedeCrearEnModulo('Tipos de habitación')) && (
            <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setMostrarModalTipo(false) }}>
              <section className="reservation-modal room-create-modal" role="dialog" aria-modal="true" aria-labelledby="type-room-modal-title">
                <div className="reservation-modal-header"><div><span className="reservations-eyebrow">{tipoEnEdicion ? 'ACTUALIZAR REGISTRO' : 'NUEVO REGISTRO'}</span><h2 id="type-room-modal-title">{tipoEnEdicion ? `Editar tipo: ${tipoEnEdicion.nombre}` : 'Registrar tipo de habitación'}</h2><p>Completa los datos de acuerdo con la tabla TIPO_HABITACION.</p></div><button type="button" className="reservation-modal-close" onClick={() => setMostrarModalTipo(false)} aria-label="Cerrar ventana">×</button></div>
                <form onSubmit={guardarTipoHabitacion}><div className="reservation-form-grid">
                  <label className="reservation-form-field"><span>Nombre del tipo *</span><input type="text" placeholder="Ej. Familiar" value={formularioTipo.nombre} onChange={e => setFormularioTipo(a => ({ ...a, nombre: e.target.value }))} required /></label>
                  <label className="reservation-form-field"><span>Capacidad (personas) *</span><input type="number" min="1" step="1" placeholder="Ej. 4" value={formularioTipo.capacidad} onChange={e => setFormularioTipo(a => ({ ...a, capacidad: e.target.value }))} required /></label>
                  <label className="reservation-form-field" style={{ gridColumn: '1 / -1' }}><span>Descripción</span><input type="text" placeholder="Describe brevemente el tipo de habitación" value={formularioTipo.descripcion} onChange={e => setFormularioTipo(a => ({ ...a, descripcion: e.target.value }))} /></label>
                  <label className="reservation-form-field"><span>Precio base (S/)</span><input type="number" min="0" step="0.01" placeholder="Opcional" value={formularioTipo.precio_base} onChange={e => setFormularioTipo(a => ({ ...a, precio_base: e.target.value }))} /></label>
                </div>{errorTipo && <p className="reservation-form-error" role="alert">{errorTipo}</p>}<div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setMostrarModalTipo(false)}>Cancelar</button><button type="submit" className="reservation-save-button">{tipoEnEdicion ? 'Guardar cambios' : 'Registrar tipo'}</button></div></form>
              </section>
            </div>
          )}

          {tipoPorEliminar && (() => {
            const relacionadas = habitacionesVisibles.filter(h => Number(h.tipo_habitacion_id_tipo) === Number(tipoPorEliminar.id_tipo))
            return <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setTipoPorEliminar(null) }}><section className="reservation-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="type-room-delete-title"><div className="reservation-confirm-icon">!</div><h2 id="type-room-delete-title">{relacionadas.length ? 'No se puede eliminar este tipo' : '¿Eliminar este tipo de habitación?'}</h2>{relacionadas.length ? <><p>El tipo <strong>{tipoPorEliminar.nombre}</strong> está siendo utilizado por habitaciones registradas.</p><div className="reservation-confirm-notice"><strong>{relacionadas.length}</strong> habitación(es) dependen de este tipo. Cambia primero el tipo asignado a esas habitaciones para conservar la integridad referencial.</div><div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setTipoPorEliminar(null)}>Cerrar</button></div></> : <><p>Estás por eliminar el tipo <strong>{tipoPorEliminar.nombre}</strong>. Esta acción no se podrá deshacer.</p><div className="reservation-confirm-notice">Solo se permite eliminar tipos que no estén asociados a habitaciones.</div><div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setTipoPorEliminar(null)}>Conservar tipo</button><button type="button" className="reservation-confirm-danger-button" onClick={confirmarEliminarTipo}>Sí, eliminar</button></div></>}</section></div>
          })()}

          {tipoSeleccionado && (() => {
            const habitacionesRelacionadas = habitacionesVisibles.filter(habitacion => Number(habitacion.tipo_habitacion_id_tipo) === Number(tipoSeleccionado.id_tipo))
            return <div className="reservation-modal-backdrop" onMouseDown={evento => { if (evento.target === evento.currentTarget) setTipoSeleccionado(null) }}>
              <section className="reservation-detail-modal room-detail-modal types-room-detail-modal" role="dialog" aria-modal="true" aria-labelledby="type-room-detail-title">
                <div className="reservation-modal-header"><div><span className="reservations-eyebrow">INFORMACIÓN DEL REGISTRO</span><h2 id="type-room-detail-title">Detalle: {tipoSeleccionado.nombre}</h2><p>Datos de TIPO_HABITACION y habitaciones relacionadas.</p></div><button type="button" className="reservation-modal-close" onClick={() => setTipoSeleccionado(null)} aria-label="Cerrar ventana">×</button></div>
                <DetailPrimaryKey label="ID_TIPO (PK)" value={tipoSeleccionado.id_tipo} />
                <div className="reservation-detail-grid types-room-detail-grid">
                  <section className="reservation-detail-group"><h3>Datos del tipo de habitación</h3><div className="reservation-detail-item"><span>Nombre del tipo</span><strong>{tipoSeleccionado.nombre}</strong></div><div className="reservation-detail-item"><span>Descripción</span><strong>{tipoSeleccionado.descripcion || 'No registrado'}</strong></div><div className="reservation-detail-item"><span>Capacidad</span><strong>{tipoSeleccionado.capacidad} persona(s)</strong></div><div className="reservation-detail-item"><span>Precio base</span><strong>{tipoSeleccionado.precio_base == null ? 'No registrado' : `S/ ${Number(tipoSeleccionado.precio_base).toFixed(2)}`}</strong></div></section>
                </div>
                <DetailRelatedRecords title="Habitaciones relacionadas" rows={habitacionesRelacionadas} emptyMessage="Todavía no hay habitaciones que utilicen este tipo." columns={[
                  { key: 'id_habitacion', label: 'ID_HABITACION (PK)', render: habitacion => habitacion.id_habitacion ?? habitacion.id },
                  { key: 'numero', label: 'NUMERO', render: habitacion => habitacion.numero },
                  { key: 'piso', label: 'PISO', render: habitacion => habitacion.piso ?? 'No registrado' },
                  { key: 'estado', label: 'ESTADO', render: habitacion => habitacion.estado || 'No registrado' },
                ]} />
                <div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setTipoSeleccionado(null)}>Cerrar</button></div>
              </section>
            </div>
          })()}
          {habitacionSeleccionada && (() => {
            const tipoDetalle = tiposHabitacion.find(tipo => tipo.id_tipo === habitacionSeleccionada.tipo_habitacion_id_tipo)
            const hotelDetalle = hoteles.find(hotel => hotel.id_hotel === habitacionSeleccionada.hotel_id_hotel)
            const reservasHabitacion = reservasVisibles.filter(reserva => Number(reserva.habitacion_id_habitacion) === Number(habitacionSeleccionada.id))
            const mantenimientosHabitacion = employeeSession ? [] : mantenimientos.filter(mantenimiento => Number(mantenimiento.habitacion_id_habitacion) === Number(habitacionSeleccionada.id_habitacion ?? habitacionSeleccionada.id))
            const mostrarDato = valor => valor || 'No registrado'
            return (
              <div className="reservation-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setHabitacionSeleccionada(null) }}>
                <section className="reservation-detail-modal room-detail-modal detail-wide-modal" role="dialog" aria-modal="true" aria-labelledby="room-detail-title">
                  <div className="reservation-modal-header">
                    <div>
                      <span className="reservations-eyebrow">INFORMACIÓN DEL REGISTRO</span>
                      <h2 id="room-detail-title">Detalle de habitación</h2>
                      <p>Información de las entidades relacionadas y de la tabla HABITACION.</p>
                    </div>
                    <button type="button" className="reservation-modal-close" onClick={() => setHabitacionSeleccionada(null)} aria-label="Cerrar detalle">×</button>
                  </div>

                  <DetailPrimaryKey label="ID_HABITACION (PK)" value={habitacionSeleccionada.id} />

                  <div className="reservation-detail-grid">
                    <article className="reservation-detail-group">
                      <h3>Datos del hotel</h3>
                      <div className="reservation-detail-item"><span>ID_HOTEL (FK)</span><strong>{hotelDetalle?.id_hotel ?? habitacionSeleccionada.hotel_id_hotel}</strong></div>
                      <div className="reservation-detail-item"><span>Nombre</span><strong>{mostrarDato(hotelDetalle?.nombre)}</strong></div>
                      <div className="reservation-detail-item"><span>Dirección</span><strong>{mostrarDato(hotelDetalle?.direccion)}</strong></div>
                      <div className="reservation-detail-item"><span>Ciudad</span><strong>{mostrarDato(hotelDetalle?.ciudad)}</strong></div>
                      <div className="reservation-detail-item"><span>País</span><strong>{mostrarDato(hotelDetalle?.pais)}</strong></div>
                      <div className="reservation-detail-item"><span>Teléfono</span><strong>{mostrarDato(hotelDetalle?.telefono)}</strong></div>
                      <div className="reservation-detail-item"><span>Email</span><strong>{mostrarDato(hotelDetalle?.email)}</strong></div>
                      <div className="reservation-detail-item"><span>Categoría</span><strong>{mostrarDato(hotelDetalle?.categoria)}</strong></div>
                    </article>

                    <article className="reservation-detail-group">
                      <h3>Datos del tipo de habitación</h3>
                      <div className="reservation-detail-item"><span>ID_TIPO (FK)</span><strong>{tipoDetalle?.id_tipo ?? habitacionSeleccionada.tipo_habitacion_id_tipo}</strong></div>
                      <div className="reservation-detail-item"><span>Nombre del tipo</span><strong>{mostrarDato(tipoDetalle?.nombre)}</strong></div>
                      <div className="reservation-detail-item"><span>Descripción</span><strong>{mostrarDato(tipoDetalle?.descripcion)}</strong></div>
                      <div className="reservation-detail-item"><span>Capacidad</span><strong>{tipoDetalle?.capacidad ? `${tipoDetalle.capacidad} persona(s)` : 'No registrado'}</strong></div>
                      <div className="reservation-detail-item"><span>Precio base</span><strong>{tipoDetalle?.precio_base != null ? `S/ ${Number(tipoDetalle.precio_base).toFixed(2)}` : 'No registrado'}</strong></div>
                    </article>

                    <article className="reservation-detail-group">
                      <h3>Datos de la habitación</h3>
                      <div className="reservation-detail-grid">
                        <div className="reservation-detail-item"><span>Número</span><strong>{habitacionSeleccionada.numero}</strong></div>
                        <div className="reservation-detail-item"><span>Piso</span><strong>{habitacionSeleccionada.piso}</strong></div>
                        <div className="reservation-detail-item"><span>Estado</span><strong>{habitacionSeleccionada.estado}</strong></div>
                      </div>
                    </article>
                  </div>

                  <DetailRelatedRecords title="Reservas asociadas" rows={reservasHabitacion} emptyMessage="Esta habitación todavía no tiene reservas asociadas." columns={[
                    { key: 'id_reserva', label: 'ID_RESERVA (PK)', render: row => row.id_reserva },
                    { key: 'fecha_reserva', label: 'FECHA_RESERVA', render: row => formatearFechaReserva(row.fecha_reserva) },
                    { key: 'fecha_entrada', label: 'FECHA_ENTRADA', render: row => formatearFechaReserva(row.fecha_entrada) },
                    { key: 'fecha_salida', label: 'FECHA_SALIDA', render: row => formatearFechaReserva(row.fecha_salida) },
                    { key: 'estado', label: 'ESTADO', render: row => row.estado },
                    { key: 'total_estimado', label: 'TOTAL_ESTIMADO', render: row => formatearMontoReserva(row.total_estimado) },
                    { key: 'monto_adelanto', label: 'MONTO_ADELANTO', render: row => formatearMontoReserva(row.monto_adelanto) },
                  ]} />
                  {!employeeSession && <DetailRelatedRecords title="Mantenimientos asociados" rows={mantenimientosHabitacion} emptyMessage="Esta habitación todavía no tiene mantenimientos asociados." columns={[
                    { key: 'id_mantenimiento', label: 'ID_MANTENIMIENTO (PK)', render: row => row.id_mantenimiento },
                    { key: 'fecha_inicio', label: 'FECHA_INICIO', render: row => formatearFechaReserva(row.fecha_inicio) },
                    { key: 'tipo', label: 'TIPO', render: row => row.tipo },
                    { key: 'costo', label: 'COSTO', render: row => formatearMontoReserva(row.costo) },
                  ]} />}

                  <div className="reservation-modal-footer">
                    <button type="button" className="reservation-save-button" onClick={() => setHabitacionSeleccionada(null)}>Cerrar detalle</button>
                  </div>
                </section>
              </div>
            )
          })()}

          {mostrarModalHabitacion && puedeCrearEnModulo('Habitaciones') && (
            <div className="reservation-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setMostrarModalHabitacion(false) }}>
              <section className="reservation-modal room-create-modal" role="dialog" aria-modal="true" aria-labelledby="room-create-title">
                <div className="reservation-modal-header">
                  <div><span className="reservations-eyebrow">NUEVO REGISTRO</span><h2 id="room-create-title">Registrar habitación</h2><p>Ingresa los datos de acuerdo con la tabla HABITACION.</p></div>
                  <button type="button" className="reservation-modal-close" onClick={() => setMostrarModalHabitacion(false)} aria-label="Cerrar ventana">×</button>
                </div>
                <form onSubmit={registrarHabitacion}>
                  <div className="reservation-form-grid">
                    <label className="reservation-form-field"><span>Número de habitación *</span><input type="text" inputMode="numeric" placeholder="Ej. 401" value={nuevaHabitacion.numero} onChange={e => setNuevaHabitacion(actual => ({ ...actual, numero: e.target.value }))} required /></label>
                    <label className="reservation-form-field"><span>Tipo de habitación *</span><select value={nuevaHabitacion.tipo} onChange={e => setNuevaHabitacion(actual => ({ ...actual, tipo: e.target.value }))} required><option value="">Selecciona un tipo</option>{tiposHabitacion.map(tipo => <option key={tipo.id_tipo} value={tipo.id_tipo}>{tipo.nombre}</option>)}</select></label>
                    <label className="reservation-form-field"><span>Hotel relacionado (FK) *</span><select value={nuevaHabitacion.hotel_id_hotel} onChange={e => setNuevaHabitacion(actual => ({ ...actual, hotel_id_hotel: e.target.value }))} required><option value="">Selecciona un hotel</option>{hoteles.map(hotel => <option key={hotel.id_hotel} value={hotel.id_hotel}>{hotel.nombre}</option>)}</select></label>
                    <label className="reservation-form-field"><span>Piso *</span><input type="number" min="1" step="1" placeholder="Ej. 4" value={nuevaHabitacion.piso} onChange={e => setNuevaHabitacion(actual => ({ ...actual, piso: e.target.value }))} required /></label>
                    <label className="reservation-form-field"><span>Estado *</span><select value={nuevaHabitacion.estado} onChange={e => setNuevaHabitacion(actual => ({ ...actual, estado: e.target.value }))} required><option value="DISPONIBLE">Disponible</option><option value="OCUPADA">Ocupada</option><option value="MANTENIMIENTO">Mantenimiento</option></select></label>
                  </div>
                  {errorHabitacion && <p className="reservation-form-error" role="alert">{errorHabitacion}</p>}
                  <div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setMostrarModalHabitacion(false)}>Cancelar</button><button type="submit" className="reservation-save-button">Registrar habitación</button></div>
                </form>
              </section>
            </div>
          )}


          {habitacionEnEdicion && puedeEditarEnModulo('Habitaciones') && (
            <div className="reservation-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setHabitacionEnEdicion(null) }}>
              <section className="reservation-modal reservation-edit-modal room-create-modal" role="dialog" aria-modal="true" aria-labelledby="room-edit-title">
                <div className="reservation-modal-header">
                  <div><span className="reservations-eyebrow">ACTUALIZAR REGISTRO</span><h2 id="room-edit-title">Editar habitación {habitacionEnEdicion.numero}</h2><p>Modifica los datos de acuerdo con la tabla HABITACION.</p></div>
                  <button type="button" className="reservation-modal-close" onClick={() => setHabitacionEnEdicion(null)} aria-label="Cerrar ventana">×</button>
                </div>
                <form onSubmit={guardarEdicionHabitacion}>
                  <div className="reservation-form-grid">
                    <label className="reservation-form-field"><span>Número de habitación *</span><input type="text" inputMode="numeric" placeholder="Ej. 401" value={formularioHabitacionEdicion.numero} onChange={e => setFormularioHabitacionEdicion(actual => ({ ...actual, numero: e.target.value }))} required /></label>
                    <label className="reservation-form-field"><span>Tipo de habitación *</span><select value={formularioHabitacionEdicion.tipo} onChange={e => setFormularioHabitacionEdicion(actual => ({ ...actual, tipo: e.target.value }))} required><option value="">Selecciona un tipo</option>{tiposHabitacion.map(tipo => <option key={tipo.id_tipo} value={tipo.id_tipo}>{tipo.nombre}</option>)}</select></label>
                    <label className="reservation-form-field"><span>Hotel relacionado (FK) *</span><select value={formularioHabitacionEdicion.hotel_id_hotel} onChange={e => setFormularioHabitacionEdicion(actual => ({ ...actual, hotel_id_hotel: e.target.value }))} required><option value="">Selecciona un hotel</option>{hoteles.map(hotel => <option key={hotel.id_hotel} value={hotel.id_hotel}>{hotel.nombre}</option>)}</select></label>
                    <label className="reservation-form-field"><span>Piso *</span><input type="number" min="1" step="1" placeholder="Ej. 4" value={formularioHabitacionEdicion.piso} onChange={e => setFormularioHabitacionEdicion(actual => ({ ...actual, piso: e.target.value }))} required /></label>
                    <label className="reservation-form-field"><span>Estado *</span><select value={formularioHabitacionEdicion.estado} onChange={e => setFormularioHabitacionEdicion(actual => ({ ...actual, estado: e.target.value }))} required><option value="DISPONIBLE">Disponible</option><option value="OCUPADA">Ocupada</option><option value="MANTENIMIENTO">Mantenimiento</option></select></label>
                  </div>
                  {errorEdicionHabitacion && <p className="reservation-form-error" role="alert">{errorEdicionHabitacion}</p>}
                  <div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setHabitacionEnEdicion(null)}>Cancelar</button><button type="submit" className="reservation-save-button">Guardar cambios</button></div>
                </form>
              </section>
            </div>
          )}

          {habitacionPorEliminar && (() => {
            const reservasRelacionadas = reservasVisibles.filter(
              reserva => Number(reserva.habitacion_id_habitacion) === Number(habitacionPorEliminar.id)
            )
            const mantenimientosRelacionados = mantenimientos.filter(
              mantenimiento => Number(mantenimiento.habitacion_id_habitacion) === Number(habitacionPorEliminar.id)
            )
            const tieneRelaciones = reservasRelacionadas.length > 0 || mantenimientosRelacionados.length > 0
            return (
              <div className="reservation-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setHabitacionPorEliminar(null) }}>
                <section className="reservation-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="room-delete-title">
                  <div className="reservation-confirm-icon">!</div>
                  <h2 id="room-delete-title">{tieneRelaciones ? 'No se puede eliminar esta habitación' : '¿Eliminar esta habitación?'}</h2>
                  {tieneRelaciones ? (
                    <>
                      <p>La habitación <strong>{habitacionPorEliminar.numero}</strong> tiene registros relacionados:</p>
                      <div className="reservation-confirm-notice">
                        {reservasRelacionadas.length > 0 && <div><strong>{reservasRelacionadas.length}</strong> reserva(s) asociada(s).</div>}
                        {mantenimientosRelacionados.length > 0 && <div><strong>{mantenimientosRelacionados.length}</strong> registro(s) de mantenimiento asociado(s).</div>}
                        No es posible eliminarla porque esos registros dependen de esta habitación. Esta restricción protege la integridad de los datos.
                      </div>
                      <div className="reservation-modal-footer">
                        <button type="button" className="reservation-cancel-button" onClick={() => setHabitacionPorEliminar(null)}>Cerrar</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>Estás por eliminar la habitación <strong>{habitacionPorEliminar.numero}</strong>. Esta acción quitará el registro de la lista y no se podrá deshacer.</p>
                      <div className="reservation-confirm-notice">Solo se permite eliminar habitaciones que no tengan reservas ni registros de mantenimiento asociados.</div>
                      <div className="reservation-modal-footer">
                        <button type="button" className="reservation-cancel-button" onClick={() => setHabitacionPorEliminar(null)}>Conservar habitación</button>
                        <button type="button" className="reservation-confirm-danger-button" onClick={confirmarEliminarHabitacion}>Sí, eliminar</button>
                      </div>
                    </>
                  )}
                </section>
              </div>
            )
          })()}
        </section>
      )
    }

    // ========================================
    // MODULO RESERVAS
    // ========================================

    if (seccionActiva === 'Reservas') {
      const atributoFiltroReservaSeleccionado = atributosFiltrosReserva.find(item => item.campo === campoFiltroReserva)
      const atributosDisponiblesReserva = atributosFiltrosReserva.filter(atributo =>
        !filtrosAvanzadosReserva.some(criterio => criterio.campo === atributo.campo)
      )
      const estadosReservaDisponibles = [...new Set(reservas.map(reserva => reserva.estado).filter(Boolean))]

      if (subseccionReservas === 'estadias') {
        return (
          <section className="rooms-section reservations-section">
            <div className="reservations-heading">
              <div className="welcome"><span className="reservations-eyebrow">GESTIÓN HOTELERA</span><h1>Gestión de reservas</h1><p>Administra las reservas y las estadías de los huéspedes de Hotel Los Andes.</p></div>
              <div className="reservations-heading-note"><span className="reservations-note-icon">▦</span><div><strong>{estadiasVisibles.length} registros</strong><span>Estadías en el sistema</span></div></div>
            </div>
            <div className="services-subnav" role="tablist" aria-label="Secciones de reservas">
              <button type="button" className="services-subnav-button" onClick={() => setSubseccionReservas('reservas')}>Reservas</button>
              <button type="button" className="services-subnav-button active" aria-current="page">Estadías</button>
            </div>
            <div className="room-summary reservations-summary">
              <article className="room-summary-card reservation-stat reservation-stat-total"><div className="reservation-stat-top"><span>Total de estadías</span><span className="reservation-stat-icon">▤</span></div><h2>{estadiasVisibles.length}</h2><small>Registros almacenados</small></article>
              <article className="room-summary-card reservation-stat reservation-stat-confirmed"><div className="reservation-stat-top"><span>Check-in registrados</span><span className="reservation-stat-icon">✓</span></div><h2>{estadiasVisibles.filter(item => item.fecha_check_in).length}</h2><small>Ingresos registrados</small></article>
              <article className="room-summary-card reservation-stat reservation-stat-completed"><div className="reservation-stat-top"><span>Check-out registrados</span><span className="reservation-stat-icon">▣</span></div><h2>{estadiasVisibles.filter(item => item.fecha_check_out).length}</h2><small>Salidas registradas</small></article>
              <article className="room-summary-card reservation-stat reservation-stat-cancelled"><div className="reservation-stat-top"><span>Resultados encontrados</span><span className="reservation-stat-icon">⌕</span></div><h2>{estadiasFiltradas.length}</h2><small>Coincidencias de búsqueda</small></article>
            </div>
            <div className="room-list reservations-list">
              <div className="room-list-header reservations-list-header"><div><h2>Listado de estadías</h2><p>Registros de la tabla ESTADIA relacionados con su reserva y empleado.</p></div><div className="reservations-header-actions"><span className="reservations-total-pill">{estadiasFiltradas.length} resultados</span><button type="button" className="reservation-new-button" hidden={!puedeCrearEnModulo('Estadias')} onClick={abrirRegistroEstadia} disabled={reservas.every(item => item.estado === 'CANCELADA') || empleadosDelHotel.length === 0} title={empleadosDelHotel.length === 0 ? 'Registra un empleado antes de crear una estadía.' : undefined}>＋ Nueva estadía</button></div></div>
              <DynamicListFilterPanel title="Estadías" listKey="estadias" searchValue={busquedaEstadia} searchPlaceholder="Buscar por identificador, fecha, reserva o cliente..." attributes={atributosFiltroEstadias} activeFilters={obtenerFiltrosActivosLista('estadias')} onSearchChange={valor => actualizarFiltroLista('estadias', setBusquedaEstadia, valor)} onAddFilter={agregarFiltroAvanzadoLista} onRemoveFilter={quitarFiltroAvanzadoLista} onClearFilters={lista => { setBusquedaEstadia(''); limpiarFiltrosAvanzadosLista(lista) }} />
<div className="table-container reservations-table-container"><table className="rooms-table reservations-table"><thead><tr><SortableHeader field='id' list='estadias' label='ID_ESTADIA' sort={ordenesLista['estadias']} onSort={campo => alternarOrdenLista('estadias', campo)} /><SortableHeader field='entrada' list='estadias' label='FECHA_CHECK_IN' sort={ordenesLista['estadias']} onSort={campo => alternarOrdenLista('estadias', campo)} /><SortableHeader field='salida' list='estadias' label='FECHA_CHECK_OUT' sort={ordenesLista['estadias']} onSort={campo => alternarOrdenLista('estadias', campo)} /><th className="reservation-action-heading">ACCIONES</th></tr></thead><tbody>
                {estadiasPagina.rows.map(estadia => <tr key={estadia.id_estadia}><td>{estadia.id_estadia}</td><td>{formatearFechaReserva(estadia.fecha_check_in)}</td><td>{formatearFechaReserva(estadia.fecha_check_out)}</td><td className="reservation-action-cell"><div className="reservation-row-actions"><button type="button" className="reservation-detail-button" onClick={() => setEstadiaSeleccionada(estadia)}>Ver detalle</button><button type="button" className="reservation-edit-button" hidden={!puedeEditarEnModulo('Estadias')} onClick={() => abrirEdicionEstadia(estadia)}>Editar</button><button type="button" className="reservation-cancel-record-button" hidden={!puedeEliminarEnModulo()} onClick={() => { setEstadiaPorEliminar(estadia); setErrorEstadia('') }}>Eliminar</button></div></td></tr>)}
                {estadiasFiltradas.length === 0 && <tr><td colSpan="4" className="empty-message">{busquedaEstadia ? 'No se encontraron estadías con ese criterio.' : 'Todavía no hay estadías registradas en ESTADIA.'}</td></tr>}
              </tbody></table></div>
              <div className="reservations-list-footer"><span>Mostrando {estadiasFiltradas.length} de {estadiasVisibles.length} estadías</span><span>Tabla ESTADIA del modelo relacional</span></div>
              <ListPagination totalItems={estadiasFiltradas.length} {...estadiasPagina} onPageChange={pagina => cambiarPaginaLista('estadias', pagina)} onPageSizeChange={tamano => cambiarTamanoPaginaLista('estadias', tamano)} />
              {!reservasVisibles.length && <p className="service-no-consumptions">Para registrar una estadía primero debe existir una reserva.</p>}
            </div>
            {mostrarModalEstadia && <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setMostrarModalEstadia(false) }}><section className="reservation-modal" role="dialog" aria-modal="true" aria-labelledby="estadia-modal-title"><div className="reservation-modal-header"><div><span className="reservations-eyebrow">{estadiaEnEdicion ? 'ACTUALIZAR REGISTRO' : 'NUEVO REGISTRO'}</span><h2 id="estadia-modal-title">{estadiaEnEdicion ? `Editar estadía ${estadiaEnEdicion.id_estadia}` : 'Registrar estadía'}</h2><p>Completa las fechas y selecciona la reserva y el empleado responsable.</p></div><button type="button" className="reservation-modal-close" onClick={() => setMostrarModalEstadia(false)} aria-label="Cerrar ventana">×</button></div><form onSubmit={guardarEstadia}><div className="reservation-form-grid"><label className="reservation-form-field"><span>Reserva relacionada *</span><select value={formularioEstadia.reserva_id_reserva} onChange={e => setFormularioEstadia(actual => ({ ...actual, reserva_id_reserva: e.target.value }))} required><option value="">Selecciona una reserva</option>{reservasVisibles.filter(item => item.estado !== 'CANCELADA').map(item => <option key={item.id_reserva} value={item.id_reserva}>RES-{String(item.id_reserva).padStart(3, '0')} · {nombreClienteReserva(item)} · Hab. {numeroHabitacionReserva(item)}</option>)}</select><small>Esta selección mantiene la clave foránea de RESERVA.</small></label><label className="reservation-form-field"><span>Empleado responsable *</span><select value={formularioEstadia.empleado_id_empleado} onChange={e => setFormularioEstadia(actual => ({ ...actual, empleado_id_empleado: e.target.value }))} required><option value="">Selecciona un empleado</option>{empleadosDelHotel.map(empleado => <option key={empleado.id} value={empleado.id}>{empleado.nombre} {empleado.apellido} · ID {empleado.id}</option>)}</select><small>Esta selección mantiene EMPLEADO_ID_EMPLEADO.</small></label><label className="reservation-form-field"><span>Fecha de check-in *</span><input type="date" value={formularioEstadia.fecha_check_in} onChange={e => setFormularioEstadia(actual => ({ ...actual, fecha_check_in: e.target.value }))} required /></label><label className="reservation-form-field"><span>Fecha de check-out *</span><input type="date" min={formularioEstadia.fecha_check_in || undefined} value={formularioEstadia.fecha_check_out} onChange={e => setFormularioEstadia(actual => ({ ...actual, fecha_check_out: e.target.value }))} required /></label></div>{errorEstadia && <p className="reservation-form-error" role="alert">{errorEstadia}</p>}<div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setMostrarModalEstadia(false)}>Cancelar</button><button type="submit" className="reservation-save-button">{estadiaEnEdicion ? 'Guardar cambios' : 'Registrar estadía'}</button></div></form></section></div>}
            {estadiaSeleccionada && (() => { const reserva = obtenerReservaEstadia(estadiaSeleccionada); const empleado = obtenerEmpleadoEstadia(estadiaSeleccionada); const cargo = empleado ? obtenerCargoEmpleado(empleado) : null; const hotel = empleado ? obtenerHotelEmpleado(empleado) : null; const pagosEstadia = pagosVisibles.filter(pago => Number(pago.estadia_id_estadia) === Number(estadiaSeleccionada.id_estadia)); const consumosEstadia = consumosVisibles.filter(consumo => Number(consumo.estadia_id_estadia) === Number(estadiaSeleccionada.id_estadia)); return <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setEstadiaSeleccionada(null) }}><section className="reservation-detail-modal detail-wide-modal" role="dialog" aria-modal="true" aria-labelledby="estadia-detail-title"><div className="reservation-modal-header"><div><span className="reservations-eyebrow">INFORMACIÓN DEL REGISTRO</span><h2 id="estadia-detail-title">Detalle de estadía</h2><p>Información de ESTADIA y sus entidades relacionadas.</p></div><button type="button" className="reservation-modal-close" onClick={() => setEstadiaSeleccionada(null)} aria-label="Cerrar detalle">×</button></div><DetailPrimaryKey label="ID_ESTADIA (PK)" value={estadiaSeleccionada.id_estadia} /><div className="reservation-detail-grid"><article className="reservation-detail-group"><h3>Datos de la estadía</h3><div className="reservation-detail-item"><span>Fecha de check-in</span><strong>{formatearFechaReserva(estadiaSeleccionada.fecha_check_in)}</strong></div><div className="reservation-detail-item"><span>Fecha de check-out</span><strong>{formatearFechaReserva(estadiaSeleccionada.fecha_check_out)}</strong></div></article><article className="reservation-detail-group"><h3>Reserva relacionada</h3><div className="reservation-detail-item"><span>RESERVA_ID_RESERVA (FK)</span><strong>{estadiaSeleccionada.reserva_id_reserva ?? reserva?.id_reserva ?? 'No registrado'}</strong></div><div className="reservation-detail-item"><span>Cliente</span><strong>{reserva ? nombreClienteReserva(reserva) : 'No registrado'}</strong></div><div className="reservation-detail-item"><span>Habitación</span><strong>{reserva ? `Hab. ${numeroHabitacionReserva(reserva)}` : 'No registrado'}</strong></div></article><article className="reservation-detail-group"><h3>Empleado responsable</h3><div className="reservation-detail-item"><span>EMPLEADO_ID_EMPLEADO (FK)</span><strong>{estadiaSeleccionada.empleado_id_empleado ?? empleado?.id ?? 'No encontrado'}</strong></div><div className="reservation-detail-item"><span>Nombre</span><strong>{empleado ? `${empleado.nombre} ${empleado.apellido}` : 'No encontrado'}</strong></div><div className="reservation-detail-item"><span>Documento</span><strong>{empleado?.documento ?? 'No registrado'}</strong></div><div className="reservation-detail-item"><span>Fecha de ingreso</span><strong>{empleado?.fechaIngreso ? formatearFechaReserva(empleado.fechaIngreso) : 'No registrada'}</strong></div><div className="reservation-detail-item"><span>Cargo</span><strong>{cargo?.nombre ?? 'No registrado'}</strong></div><div className="reservation-detail-item"><span>Hotel</span><strong>{hotel?.nombre ?? 'No registrado'}</strong></div></article></div><DetailRelatedRecords title="Pagos asociados" rows={pagosEstadia} emptyMessage="Esta estadía todavía no tiene pagos asociados." columns={[{ key: 'id_pago', label: 'ID_PAGO (PK)', render: row => row.id_pago }, { key: 'fecha_pago', label: 'FECHA_PAGO', render: row => formatearFechaReserva(row.fecha_pago) }, { key: 'monto', label: 'MONTO', render: row => formatearMontoReserva(row.monto) }, { key: 'metodo_pago', label: 'METODO_PAGO', render: row => row.metodo_pago }]} /><DetailRelatedRecords title="Consumos asociados" rows={consumosEstadia} emptyMessage="Esta estadía todavía no tiene consumos asociados." columns={[{ key: 'id_consumo', label: 'ID_CONSUMO (PK)', render: row => row.id_consumo }, { key: 'cantidad', label: 'CANTIDAD', render: row => row.cantidad }, { key: 'subtotal', label: 'SUBTOTAL', render: row => formatearMontoReserva(row.subtotal) }]} /><div className="reservation-modal-footer"><button type="button" className="reservation-save-button" onClick={() => setEstadiaSeleccionada(null)}>Cerrar detalle</button></div></section></div> })()}
            {estadiaPorEliminar && (() => {
              const consumosRelacionados = consumosVisibles.filter(consumo => Number(consumo.estadia_id_estadia) === Number(estadiaPorEliminar.id_estadia))
              const pagosRelacionados = pagosVisibles.filter(pago => Number(pago.estadia_id_estadia) === Number(estadiaPorEliminar.id_estadia))
              const tieneDependencias = consumosRelacionados.length > 0 || pagosRelacionados.length > 0
              return <div className="reservation-modal-backdrop"><section className="reservation-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="estadia-delete-title"><div className="reservation-confirm-icon">!</div><h2 id="estadia-delete-title">{tieneDependencias ? 'No se puede eliminar esta estadía' : '¿Eliminar esta estadía?'}</h2><p>{tieneDependencias ? <>La estadía <strong>{estadiaPorEliminar.id_estadia}</strong> tiene registros relacionados y debe conservarse.</> : <>Se eliminará la estadía <strong>{estadiaPorEliminar.id_estadia}</strong>.</>}</p>{tieneDependencias && <div className="reservation-confirm-notice">{consumosRelacionados.length > 0 && <div><strong>{consumosRelacionados.length}</strong> consumo(s) asociado(s).</div>}{pagosRelacionados.length > 0 && <div><strong>{pagosRelacionados.length}</strong> pago(s) asociado(s).</div>}Elimina o reasigna esos registros antes de eliminar la estadía.</div>}{errorEstadia && <div className="reservation-confirm-notice">{errorEstadia}</div>}<div className="reservation-modal-footer">{tieneDependencias ? <button type="button" className="reservation-cancel-button" onClick={() => { setEstadiaPorEliminar(null); setErrorEstadia('') }}>Cerrar</button> : <><button type="button" className="reservation-cancel-button" onClick={() => { setEstadiaPorEliminar(null); setErrorEstadia('') }}>Conservar estadía</button><button type="button" className="reservation-confirm-danger-button" onClick={confirmarEliminarEstadia}>Sí, eliminar</button></>}</div></section></div>
            })()}
          </section>
        )
      }
      return (
        <section className="rooms-section reservations-section">
          <div className="reservations-heading">
            <div className="welcome">
              <span className="reservations-eyebrow">GESTIÓN HOTELERA</span>
              <h1>Gestión de reservas</h1>
              <p>Consulta y administra las reservas de Hotel Los Andes.</p>
            </div>
            <div className="reservations-heading-note">
              <span className="reservations-note-icon">▦</span>
              <div><strong>{reservasVisibles.length} registros</strong><span>Reservas en el sistema</span></div>
            </div>
          </div>

          <div className="services-subnav" role="tablist" aria-label="Secciones de reservas">
            <button type="button" className="services-subnav-button active" aria-current="page">Reservas</button>
            <button type="button" className="services-subnav-button" onClick={() => setSubseccionReservas('estadias')}>Estadías</button>
          </div>
          <div className="room-summary reservations-summary">
            <article className="room-summary-card reservation-stat reservation-stat-total">
              <div className="reservation-stat-top"><span>Total de reservas</span><span className="reservation-stat-icon">▤</span></div>
              <h2>{reservasVisibles.length}</h2><small>Registros almacenados</small>
            </article>
            <article className="room-summary-card reservation-stat reservation-stat-confirmed">
              <div className="reservation-stat-top"><span>Confirmadas</span><span className="reservation-stat-icon">✓</span></div>
              <h2>{reservasVisibles.filter(r => r.estado === 'CONFIRMADA').length}</h2><small>Reservas aprobadas</small>
            </article>
            <article className="room-summary-card reservation-stat reservation-stat-completed">
              <div className="reservation-stat-top"><span>Completadas</span><span className="reservation-stat-icon">▣</span></div>
              <h2>{reservasVisibles.filter(r => r.estado === 'COMPLETADA').length}</h2><small>Estadías finalizadas</small>
            </article>
            <article className="room-summary-card reservation-stat reservation-stat-cancelled">
              <div className="reservation-stat-top"><span>Canceladas</span><span className="reservation-stat-icon">×</span></div>
              <h2>{reservasVisibles.filter(r => r.estado === 'CANCELADA').length}</h2><small>Reservas anuladas</small>
            </article>
          </div>

          <div className="room-list reservations-list">
            <div className="room-list-header reservations-list-header">
              <div><h2>Listado de reservas</h2><p>Revisa los huéspedes, habitaciones y fechas de cada reserva.</p></div>
              <div className="reservations-header-actions">
                <span className="reservations-total-pill">{reservasFiltradas.length} resultados</span>
                <button type="button" className="reservation-new-button" hidden={!puedeCrearEnModulo('Reservas')} onClick={abrirModalReserva}>＋ Nueva reserva</button>
              </div>
            </div>
            <div className="room-filters reservations-filters list-filter-row">
              <div className="reservation-search"><span>⌕</span>
                <input type="text" placeholder="Buscar por código, cliente o habitación..." value={busquedaReserva} onChange={(e) => actualizarFiltroLista('reservas', setBusquedaReserva, e.target.value)} aria-label="Buscar reservas" />
              </div>
              <ClearFiltersButton onClick={limpiarFiltrosReserva} />
            </div>
            <section className="reservations-filter-builder" aria-label="Filtros avanzados de reservas">
              <div className="reservations-filter-builder-heading"><strong>Filtrar por</strong><span>Agrega criterios y se aplicarán todos simultáneamente.</span></div>
              <div className="reservations-filter-builder-controls">
                <select aria-label="Atributo de reserva para filtrar" value={campoFiltroReserva} onChange={e => { setCampoFiltroReserva(e.target.value); setValorFiltroReserva('') }}>
                  <option value="">Selecciona un atributo</option>
                  {atributosDisponiblesReserva.map(atributo => <option key={atributo.campo} value={atributo.campo}>{atributo.etiqueta}</option>)}
                </select>
                {atributoFiltroReservaSeleccionado?.tipo === 'cliente' && <select aria-label="Seleccionar cliente" value={valorFiltroReserva} onChange={e => setValorFiltroReserva(e.target.value)}><option value="">Selecciona un cliente</option>{clientesVisibles.map(cliente => <option key={cliente.id} value={cliente.id}>{cliente.nombre} {cliente.apellido} · {cliente.documento}</option>)}</select>}
                {atributoFiltroReservaSeleccionado?.tipo === 'habitacion' && <select aria-label="Seleccionar habitación" value={valorFiltroReserva} onChange={e => setValorFiltroReserva(e.target.value)}><option value="">Selecciona una habitación</option>{habitacionesVisibles.map(habitacion => <option key={habitacion.id} value={habitacion.id}>Habitación {habitacion.numero}</option>)}</select>}
                {atributoFiltroReservaSeleccionado?.tipo === 'estado' && <select aria-label="Seleccionar estado de reserva" value={valorFiltroReserva} onChange={e => setValorFiltroReserva(e.target.value)}><option value="">Selecciona un estado</option>{estadosReservaDisponibles.map(estado => <option key={estado} value={estado}>{estado.charAt(0) + estado.slice(1).toLowerCase()}</option>)}</select>}
                {atributoFiltroReservaSeleccionado?.tipo === 'fecha' && <input type="date" aria-label={`Valor para ${atributoFiltroReservaSeleccionado.etiqueta}`} value={valorFiltroReserva} onChange={e => setValorFiltroReserva(e.target.value)} />}
                {atributoFiltroReservaSeleccionado?.tipo === 'numero' && <input type="number" step="any" aria-label={`Valor para ${atributoFiltroReservaSeleccionado.etiqueta}`} value={valorFiltroReserva} onChange={e => setValorFiltroReserva(e.target.value)} placeholder="Introduce un número" />}
                <button type="button" className="reservations-filter-add-button" onClick={agregarFiltroReserva} disabled={!campoFiltroReserva || valorFiltroReserva === ''}>Agregar filtro</button>
              </div>
              <div className="reservations-active-filters" aria-live="polite">
                {filtrosAvanzadosReserva.length ? filtrosAvanzadosReserva.map(criterio => {
                  const atributo = atributosFiltrosReserva.find(item => item.campo === criterio.campo)
                  return <span className="reservations-active-filter" key={criterio.campo}><span><strong>{atributo?.etiqueta}:</strong> {etiquetaValorFiltroReserva(criterio)}</span><button type="button" aria-label={`Quitar filtro ${atributo?.etiqueta}`} onClick={() => quitarFiltroReserva(criterio.campo)}>×</button></span>
                }) : <span className="reservations-no-active-filters">No hay filtros avanzados activos.</span>}
              </div>
            </section>
            <div className="table-container reservations-table-container">
              <table className="rooms-table reservations-table reservations-entity-table">
                <thead>
                  <tr>
                    <SortableHeader field='id' list='reservas' label='ID_RESERVA' sort={ordenesLista['reservas']} onSort={campo => alternarOrdenLista('reservas', campo)} />
                    <SortableHeader field='registro' list='reservas' label='FECHA_RESERVA' sort={ordenesLista['reservas']} onSort={campo => alternarOrdenLista('reservas', campo)} />
                    <SortableHeader field='entrada' list='reservas' label='FECHA_ENTRADA' sort={ordenesLista['reservas']} onSort={campo => alternarOrdenLista('reservas', campo)} />
                    <SortableHeader field='salida' list='reservas' label='FECHA_SALIDA' sort={ordenesLista['reservas']} onSort={campo => alternarOrdenLista('reservas', campo)} />
                    <SortableHeader field='estado' list='reservas' label='ESTADO' sort={ordenesLista['reservas']} onSort={campo => alternarOrdenLista('reservas', campo)} />
                    <SortableHeader field='total' list='reservas' label='TOTAL_ESTIMADO' sort={ordenesLista['reservas']} onSort={campo => alternarOrdenLista('reservas', campo)} />
                    <SortableHeader field='adelanto' list='reservas' label='MONTO_ADELANTO' sort={ordenesLista['reservas']} onSort={campo => alternarOrdenLista('reservas', campo)} />
                    <th className="reservation-action-heading">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {reservasPagina.rows.map(reserva => (
                      <tr key={reserva.id_reserva}>
                        <td>{reserva.id_reserva}</td>
                        <td>{formatearFechaReserva(reserva.fecha_reserva)}</td>
                        <td>{formatearFechaReserva(reserva.fecha_entrada)}</td><td>{formatearFechaReserva(reserva.fecha_salida)}</td>
                        <td><span className={`reservation-status reservation-status-${reserva.estado.toLowerCase()}`}><span className="reservation-status-dot"></span>{reserva.estado.charAt(0) + reserva.estado.slice(1).toLowerCase()}</span></td>
                        <td className="reservation-amount">{formatearMontoReserva(reserva.total_estimado)}</td>
                        <td className="reservation-amount reservation-advance">{formatearMontoReserva(reserva.monto_adelanto)}</td>
                        <td className="reservation-action-cell"><div className="reservation-row-actions"><button type="button" className="reservation-detail-button" onClick={() => abrirDetalleReserva(reserva)} aria-label={`Consultar ${codigoReserva(reserva.id_reserva)}`}>Ver detalle</button><button type="button" className="reservation-edit-button" hidden={!puedeEditarEnModulo('Reservas')} onClick={() => abrirEdicionReserva(reserva)} disabled={reserva.estado === 'CANCELADA'} title={reserva.estado === 'CANCELADA' ? 'Las reservas canceladas no se pueden editar' : 'Editar reserva'} aria-label={`Editar ${codigoReserva(reserva.id_reserva)}`}>Editar</button><button type="button" className="reservation-cancel-record-button" onClick={() => abrirConfirmacionCancelacion(reserva)} disabled={reserva.estado !== 'CONFIRMADA'} title={reserva.estado === 'CONFIRMADA' ? 'Cancelar reserva' : 'Solo se pueden cancelar reservas confirmadas'} aria-label={`Cancelar ${codigoReserva(reserva.id_reserva)}`}>Cancelar</button></div></td>
                      </tr>
                    ))}
                  {reservasFiltradas.length === 0 && <tr><td colSpan="8" className="empty-message">No se encontraron reservas que coincidan con los filtros aplicados.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="reservations-list-footer"><span>Mostrando {reservasFiltradas.length} de {reservasVisibles.length} reservas</span><span>Datos temporales estructurados según el modelo relacional</span></div>
              <ListPagination totalItems={reservasFiltradas.length} {...reservasPagina} onPageChange={pagina => cambiarPaginaLista('reservas', pagina)} onPageSizeChange={tamano => cambiarTamanoPaginaLista('reservas', tamano)} />
          </div>

          {mostrarModalReserva && (
            <div className="reservation-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setMostrarModalReserva(false) }}>
              <section className="reservation-modal" role="dialog" aria-modal="true" aria-labelledby="reservation-modal-title">
                <div className="reservation-modal-header">
                  <div><span className="reservations-eyebrow">NUEVO REGISTRO</span><h2 id="reservation-modal-title">Registrar reserva</h2><p>Los datos se organizarán de acuerdo con la tabla RESERVA.</p></div>
                  <button type="button" className="reservation-modal-close" onClick={() => setMostrarModalReserva(false)} aria-label="Cerrar ventana">×</button>
                </div>
                <form onSubmit={registrarReserva}>
                  <div className="reservation-form-grid">
                    <label className="reservation-form-field"><span>Cliente *</span>
                      <select value={clienteReserva} onChange={e => setClienteReserva(e.target.value)} required>
                        <option value="">Selecciona un cliente</option>
                        {clientesVisibles.map(cliente => <option key={cliente.id} value={cliente.id}>{cliente.nombre} {cliente.apellido} · Doc. {cliente.documento}</option>)}
                      </select>
                    </label>
                    <label className="reservation-form-field"><span>Habitación *</span>
                      <select value={habitacionReserva} onChange={e => setHabitacionReserva(e.target.value)} required>
                        <option value="">Selecciona una habitación</option>
                        {habitacionesVisibles.filter(habitacion => habitacion.estado === 'DISPONIBLE').map(habitacion => <option key={habitacion.id} value={habitacion.id}>Hab. {habitacion.numero} · {nombreTipoHabitacion(habitacion)} · Piso {habitacion.piso}</option>)}
                      </select>
                    </label>
                    <label className="reservation-form-field"><span>Fecha de entrada *</span><input type="date" value={entradaReserva} min={new Date().toLocaleDateString('en-CA')} onChange={e => setEntradaReserva(e.target.value)} required /></label>
                    <label className="reservation-form-field"><span>Fecha de salida *</span><input type="date" value={salidaReserva} min={entradaReserva || new Date().toLocaleDateString('en-CA')} onChange={e => setSalidaReserva(e.target.value)} required /></label>
                    <label className="reservation-form-field"><span>Total estimado (S/) *</span><input type="number" min="0.01" step="0.01" placeholder="Ej. 450.00" value={totalReserva} onChange={e => setTotalReserva(e.target.value)} required /></label>
                    <label className="reservation-form-field"><span>Monto de adelanto (S/)</span><input type="number" min="0" step="0.01" placeholder="0.00" value={adelantoReserva} onChange={e => setAdelantoReserva(e.target.value)} /><small>Puede ser S/ 0.00 si el huésped aún no realizó un adelanto.</small></label>
                  </div>
                  {totalReserva !== '' && adelantoReserva !== '' && Number(totalReserva) >= Number(adelantoReserva) && Number(totalReserva) > 0 && <div className="reservation-balance-preview"><span>Saldo pendiente estimado</span><strong>S/ {(Number(totalReserva) - Number(adelantoReserva)).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong></div>}
                  {errorReserva && <p className="reservation-form-error" role="alert">{errorReserva}</p>}
                  <div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setMostrarModalReserva(false)}>Cancelar</button><button type="submit" className="reservation-save-button">Registrar reserva</button></div>
                </form>
              </section>
            </div>
          )}

          {reservaEnEdicion && (
            <div className="reservation-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setReservaEnEdicion(null) }}>
              <section className="reservation-modal reservation-edit-modal" role="dialog" aria-modal="true" aria-labelledby="reservation-edit-title">
                <div className="reservation-modal-header">
                  <div><span className="reservations-eyebrow">ACTUALIZAR REGISTRO</span><h2 id="reservation-edit-title">Editar reserva {codigoReserva(reservaEnEdicion.id_reserva)}</h2><p>Modifica los datos de la reserva. El código y la fecha de registro se conservarán.</p></div>
                  <button type="button" className="reservation-modal-close" onClick={() => setReservaEnEdicion(null)} aria-label="Cerrar edición">×</button>
                </div>
                <form onSubmit={guardarEdicionReserva}>
                  <div className="reservation-form-grid">
                    <label className="reservation-form-field"><span>Cliente *</span>
                      <select value={formularioEdicion.cliente} onChange={e => setFormularioEdicion(actual => ({ ...actual, cliente: e.target.value }))} required>
                        <option value="">Selecciona un cliente</option>
                        {clientesVisibles.map(cliente => <option key={cliente.id} value={cliente.id}>{cliente.nombre} {cliente.apellido} · Doc. {cliente.documento}</option>)}
                      </select>
                    </label>
                    <label className="reservation-form-field"><span>Habitación *</span>
                      <select value={formularioEdicion.habitacion} onChange={e => setFormularioEdicion(actual => ({ ...actual, habitacion: e.target.value }))} required>
                        <option value="">Selecciona una habitación</option>
                        {habitacionesVisibles.filter(habitacion => habitacion.estado === 'DISPONIBLE' || habitacion.id === reservaEnEdicion.habitacion_id_habitacion).map(habitacion => <option key={habitacion.id} value={habitacion.id}>Hab. {habitacion.numero} · {nombreTipoHabitacion(habitacion)} · Piso {habitacion.piso}</option>)}
                      </select>
                    </label>
                    <label className="reservation-form-field"><span>Fecha de entrada *</span><input type="date" value={formularioEdicion.entrada} onChange={e => setFormularioEdicion(actual => ({ ...actual, entrada: e.target.value }))} required /></label>
                    <label className="reservation-form-field"><span>Fecha de salida *</span><input type="date" min={formularioEdicion.entrada} value={formularioEdicion.salida} onChange={e => setFormularioEdicion(actual => ({ ...actual, salida: e.target.value }))} required /></label>
                    <label className="reservation-form-field"><span>Total estimado (S/) *</span><input type="number" min="0.01" step="0.01" value={formularioEdicion.total} onChange={e => setFormularioEdicion(actual => ({ ...actual, total: e.target.value }))} required /></label>
                    <label className="reservation-form-field"><span>Monto de adelanto (S/)</span><input type="number" min="0" step="0.01" value={formularioEdicion.adelanto} onChange={e => setFormularioEdicion(actual => ({ ...actual, adelanto: e.target.value }))} /><small>Puede ser S/ 0.00 si el huésped aún no realizó un adelanto.</small></label>
                    <label className="reservation-form-field"><span>Estado de la reserva *</span>
                      <select value={formularioEdicion.estado} onChange={e => setFormularioEdicion(actual => ({ ...actual, estado: e.target.value }))} required>
                        <option value="CONFIRMADA">Confirmada</option><option value="COMPLETADA">Completada</option>
                      </select>
                    </label>
                  </div>
                  {formularioEdicion.total !== '' && formularioEdicion.adelanto !== '' && Number(formularioEdicion.total) >= Number(formularioEdicion.adelanto) && Number(formularioEdicion.total) > 0 && <div className="reservation-balance-preview"><span>Saldo pendiente estimado</span><strong>S/ {(Number(formularioEdicion.total) - Number(formularioEdicion.adelanto)).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>}
                  {errorEdicion && <p className="reservation-form-error" role="alert">{errorEdicion}</p>}
                  <div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setReservaEnEdicion(null)}>Cancelar</button><button type="submit" className="reservation-save-button">Guardar cambios</button></div>
                </form>
              </section>
            </div>
          )}

          {reservaPorCancelar && (() => {
            const tieneEstadiaAsociada = reservaTieneEstadiaAsociada(reservaPorCancelar)
            return <div className="reservation-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setReservaPorCancelar(null) }}>
              <section className="reservation-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="reservation-cancel-title">
                <div className="reservation-confirm-icon">!</div>
                <h2 id="reservation-cancel-title">{tieneEstadiaAsociada ? 'No se puede cancelar esta reserva' : '¿Cancelar esta reserva?'}</h2>
                {tieneEstadiaAsociada
                  ? <p>No se puede cancelar la reserva <strong>{codigoReserva(reservaPorCancelar.id_reserva)}</strong> porque ya tiene una estadía registrada.</p>
                  : <>
                    <p>Estás por cancelar la reserva <strong>{codigoReserva(reservaPorCancelar.id_reserva)}</strong> de <strong>{nombreClienteReserva(reservaPorCancelar)}</strong>, habitación {numeroHabitacionReserva(reservaPorCancelar)}.</p>
                    <div className="reservation-confirm-notice">El registro no se eliminará. Su estado cambiará a <strong>CANCELADA</strong> y dejará de considerarse una reserva activa.</div>
                  </>}
                <div className="reservation-modal-footer">
                  {tieneEstadiaAsociada
                    ? <button type="button" className="reservation-cancel-button" onClick={() => setReservaPorCancelar(null)}>Cerrar</button>
                    : <>
                      <button type="button" className="reservation-cancel-button" onClick={() => setReservaPorCancelar(null)}>Conservar reserva</button>
                      <button type="button" className="reservation-confirm-danger-button" onClick={confirmarCancelacionReserva}>Sí, cancelar reserva</button>
                    </>}
                </div>
              </section>
            </div>
          })()}

          {reservaSeleccionada && (() => {
            const clienteDetalle = obtenerClienteReserva(reservaSeleccionada)
            const habitacionDetalle = obtenerHabitacionReserva(reservaSeleccionada)
            const tipoDetalle = habitacionDetalle
              ? tiposHabitacion.find(tipo => tipo.id_tipo === habitacionDetalle.tipo_habitacion_id_tipo)
              : null
            const adelantoDetalle = Number(reservaSeleccionada.monto_adelanto || 0)
            const saldoDetalle = Number(reservaSeleccionada.total_estimado || 0) - adelantoDetalle

            return (
              <div className="reservation-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setReservaSeleccionada(null) }}>
                <section className="reservation-detail-modal detail-wide-modal" role="dialog" aria-modal="true" aria-labelledby="reservation-detail-title">
                  <div className="reservation-modal-header">
                    <div>
                      <span className="reservations-eyebrow">INFORMACIÓN DEL REGISTRO</span>
                      <h2 id="reservation-detail-title">Detalle de reserva</h2>
                      <p>Información relacionada con CLIENTE, HABITACION y RESERVA.</p>
                    </div>
                    <button type="button" className="reservation-modal-close" onClick={() => setReservaSeleccionada(null)} aria-label="Cerrar detalle">×</button>
                  </div>

                  <DetailPrimaryKey label="ID_RESERVA (PK)" value={reservaSeleccionada.id_reserva} accessory={<span className={`reservation-status reservation-status-${reservaSeleccionada.estado.toLowerCase()}`}><span className="reservation-status-dot"></span>{reservaSeleccionada.estado.charAt(0) + reservaSeleccionada.estado.slice(1).toLowerCase()}</span>} />

                  <div className="reservation-detail-grid">
                    <article className="reservation-detail-group">
                      <h3>Datos del cliente</h3>
                      <div className="reservation-detail-item"><span>Nombre completo</span><strong>{clienteDetalle ? `${clienteDetalle.nombre} ${clienteDetalle.apellido}` : 'Cliente no encontrado'}</strong></div>
                      <div className="reservation-detail-item"><span>Documento</span><strong>{clienteDetalle?.documento || '—'}</strong></div>
                      <div className="reservation-detail-item"><span>Correo electrónico</span><strong>{clienteDetalle?.email || '—'}</strong></div>
                      <div className="reservation-detail-item"><span>Teléfono</span><strong>{clienteDetalle?.telefono || '—'}</strong></div>
                      <div className="reservation-detail-item"><span>CLIENTE_ID_CLIENTE (FK)</span><strong>{reservaSeleccionada.cliente_id_cliente}</strong></div>
                    </article>

                    <article className="reservation-detail-group">
                      <h3>Datos de la habitación</h3>
                      <div className="reservation-detail-item"><span>Número de habitación</span><strong>{habitacionDetalle?.numero || '—'}</strong></div>
                      <div className="reservation-detail-item"><span>Tipo de habitación</span><strong>{tipoDetalle?.nombre || '—'}</strong></div>
                      <div className="reservation-detail-item"><span>Piso</span><strong>{habitacionDetalle?.piso ?? '—'}</strong></div>
                      <div className="reservation-detail-item"><span>Estado actual</span><strong>{habitacionDetalle?.estado || '—'}</strong></div>
                      <div className="reservation-detail-item"><span>HABITACION_ID_HABITACION (FK)</span><strong>{reservaSeleccionada.habitacion_id_habitacion}</strong></div>
                    </article>
                    <article className="reservation-detail-group reservation-detail-booking">
                      <h3>Datos de la reserva</h3>
                      <div className="reservation-detail-dates">
                        <div><span>Fecha de registro</span><strong>{formatearFechaReserva(reservaSeleccionada.fecha_reserva)}</strong></div>
                        <div><span>Fecha de entrada</span><strong>{formatearFechaReserva(reservaSeleccionada.fecha_entrada)}</strong></div>
                        <div><span>Fecha de salida</span><strong>{formatearFechaReserva(reservaSeleccionada.fecha_salida)}</strong></div>
                      </div>
                      <div className="reservation-detail-finances">
                        <div><span>Total estimado</span><strong>{formatearMontoReserva(reservaSeleccionada.total_estimado)}</strong></div>
                        <div><span>Monto de adelanto</span><strong>{formatearMontoReserva(adelantoDetalle)}</strong></div>
                        <div><span>Saldo pendiente (calculado)</span><strong>{formatearMontoReserva(saldoDetalle)}</strong></div>
                      </div>
                    </article>
                  </div>

                  <DetailRelatedRecords title="Estadías asociadas" rows={estadiasVisibles.filter(estadia => Number(estadia.reserva_id_reserva) === Number(reservaSeleccionada.id_reserva))} emptyMessage="Esta reserva todavía no tiene estadías asociadas." columns={[
                    { key: 'id_estadia', label: 'ID_ESTADIA (PK)', render: row => row.id_estadia },
                    { key: 'fecha_check_in', label: 'FECHA_CHECK_IN', render: row => formatearFechaReserva(row.fecha_check_in) },
                    { key: 'fecha_check_out', label: 'FECHA_CHECK_OUT', render: row => formatearFechaReserva(row.fecha_check_out) },
                  ]} />

                  <div className="reservation-modal-footer">
                    <button type="button" className="reservation-save-button" onClick={() => setReservaSeleccionada(null)}>Cerrar detalle</button>
                  </div>
                </section>
              </div>
            )
          })()}
        </section>
      )
    }

    // ========================================
    // MODULO CLIENTES
    // ========================================

    if (seccionActiva === 'Clientes') {
      return (
        <section className="rooms-section rooms-modern-section clients-section">
          <div className="reservations-heading">
            <div className="welcome">
              <span className="reservations-eyebrow">GESTIÓN HOTELERA</span>
              <h1>Gestión de clientes</h1>
              <p>Consulta y administra los clientes registrados en Hotel Los Andes.</p>
            </div>
            <div className="rooms-heading-actions">
              <div className="reservations-heading-note">
                <span className="reservations-note-icon">▦</span>
                <div><strong>{clientesVisibles.length} registros</strong><span>Clientes en el sistema</span></div>
              </div>
            </div>
          </div>

          <div className="room-summary rooms-modern-summary clients-modern-summary">
            <article className="room-summary-card reservation-stat reservation-stat-total">
              <div className="reservation-stat-top"><span>Total de clientes</span><span className="reservation-stat-icon">♙</span></div>
              <h2>{clientesVisibles.length}</h2><small>Clientes registrados</small>
            </article>
            <article className="room-summary-card reservation-stat clients-stat-registered">
              <div className="reservation-stat-top"><span>Clientes registrados</span><span className="reservation-stat-icon">✓</span></div>
              <h2>{clientesVisibles.length}</h2><small>Huéspedes en el sistema</small>
            </article>
            <article className="room-summary-card reservation-stat clients-stat-nationalities">
              <div className="reservation-stat-top"><span>Nacionalidades</span><span className="reservation-stat-icon">◎</span></div>
              <h2>{new Set(clientes.map(cliente => cliente.nacionalidad)).size}</h2><small>Países representados</small>
            </article>
            <article className="room-summary-card reservation-stat clients-stat-results">
              <div className="reservation-stat-top"><span>Resultados encontrados</span><span className="reservation-stat-icon">⌕</span></div>
              <h2>{clientesFiltrados.length}</h2><small>Coincidencias de búsqueda</small>
            </article>
          </div>

          <div className="room-list reservations-list rooms-modern-list clients-list">
            <div className="room-list-header reservations-list-header">
              <div><h2>Listado de clientes</h2><p>Administra los datos personales y de contacto de los huéspedes.</p></div>
              <div className="reservations-header-actions"><span className="reservations-total-pill">{clientesFiltrados.length} resultados</span><button type="button" className="reservation-new-button" hidden={!puedeCrearEnModulo('Clientes')} onClick={abrirRegistroCliente}>＋ Nuevo cliente</button></div>
            </div>
            <DynamicListFilterPanel title="Clientes" listKey="clientes" searchValue={busquedaCliente} searchPlaceholder="Buscar por nombre, documento, correo o teléfono..." attributes={atributosFiltroClientes} activeFilters={obtenerFiltrosActivosLista('clientes')} onSearchChange={valor => actualizarFiltroLista('clientes', setBusquedaCliente, valor)} onAddFilter={agregarFiltroAvanzadoLista} onRemoveFilter={quitarFiltroAvanzadoLista} onClearFilters={lista => { setBusquedaCliente(''); limpiarFiltrosAvanzadosLista(lista) }} />
<div className="table-container reservations-table-container rooms-modern-table-container">
              <table className="rooms-table rooms-modern-table clients-table">
                <thead><tr><SortableHeader field='id' list='clientes' label='ID' sort={ordenesLista['clientes']} onSort={campo => alternarOrdenLista('clientes', campo)} /><SortableHeader field='nombre' list='clientes' label='NOMBRE' sort={ordenesLista['clientes']} onSort={campo => alternarOrdenLista('clientes', campo)} /><SortableHeader field='apellido' list='clientes' label='APELLIDO' sort={ordenesLista['clientes']} onSort={campo => alternarOrdenLista('clientes', campo)} /><SortableHeader field='documento' list='clientes' label='DOCUMENTO' sort={ordenesLista['clientes']} onSort={campo => alternarOrdenLista('clientes', campo)} /><SortableHeader field='correo' list='clientes' label='CORREO ELECTRÓNICO' sort={ordenesLista['clientes']} onSort={campo => alternarOrdenLista('clientes', campo)} /><SortableHeader field='telefono' list='clientes' label='TELÉFONO' sort={ordenesLista['clientes']} onSort={campo => alternarOrdenLista('clientes', campo)} /><SortableHeader field='nacionalidad' list='clientes' label='NACIONALIDAD' sort={ordenesLista['clientes']} onSort={campo => alternarOrdenLista('clientes', campo)} /><th className="reservation-action-heading">ACCIONES</th></tr></thead>
                <tbody>
                  {clientesPagina.rows.map(cliente => <tr key={cliente.id}>
                    <td>{cliente.id}</td><td><strong className="client-name">{cliente.nombre}</strong></td><td>{cliente.apellido}</td><td>{cliente.documento}</td><td>{cliente.email}</td><td>{cliente.telefono}</td><td>{cliente.nacionalidad}</td>
                    <td className="reservation-action-cell"><div className="reservation-row-actions"><button type="button" className="reservation-detail-button" onClick={() => setClienteSeleccionado(cliente)}>Ver detalle</button><button type="button" className="reservation-edit-button" hidden={!puedeEditarEnModulo('Clientes')} onClick={() => abrirEdicionCliente(cliente)}>Editar</button><button type="button" className="reservation-cancel-record-button" hidden={!puedeEliminarEnModulo()} onClick={() => setClientePorEliminar(cliente)}>Eliminar</button></div></td>
                  </tr>)}
                  {clientesFiltrados.length === 0 && <tr><td colSpan="8" className="empty-message">No se encontraron clientes con esos criterios.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="reservations-list-footer"><span>Mostrando {clientesFiltrados.length} de {clientesVisibles.length} clientes</span><span>Tabla CLIENTE del modelo relacional</span></div>
              <ListPagination totalItems={clientesFiltrados.length} {...clientesPagina} onPageChange={pagina => cambiarPaginaLista('clientes', pagina)} onPageSizeChange={tamano => cambiarTamanoPaginaLista('clientes', tamano)} />
          </div>

          {mostrarModalCliente && <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setMostrarModalCliente(false) }}>
            <section className="reservation-modal room-create-modal" role="dialog" aria-modal="true" aria-labelledby="client-modal-title">
              <div className="reservation-modal-header"><div><span className="reservations-eyebrow">{clienteEnEdicion ? 'ACTUALIZAR REGISTRO' : 'NUEVO REGISTRO'}</span><h2 id="client-modal-title">{clienteEnEdicion ? `Editar cliente: ${clienteEnEdicion.nombre}` : 'Registrar nuevo cliente'}</h2><p>Completa los atributos correspondientes a la tabla CLIENTE.</p></div><button type="button" className="reservation-modal-close" onClick={() => setMostrarModalCliente(false)} aria-label="Cerrar ventana">×</button></div>
              <form onSubmit={guardarCliente}><div className="reservation-form-grid">
                <label className="reservation-form-field"><span>Nombres *</span><input value={formularioCliente.nombre} onChange={e => setFormularioCliente(a => ({ ...a, nombre: e.target.value }))} placeholder="Ej. Juan" required /></label>
                <label className="reservation-form-field"><span>Apellidos *</span><input value={formularioCliente.apellido} onChange={e => setFormularioCliente(a => ({ ...a, apellido: e.target.value }))} placeholder="Ej. Pérez" required /></label>
                <label className="reservation-form-field"><span>Documento *</span><input value={formularioCliente.documento} onChange={e => setFormularioCliente(a => ({ ...a, documento: e.target.value }))} placeholder="Número de documento" required /></label>
                <label className="reservation-form-field"><span>Correo electrónico *</span><input type="email" value={formularioCliente.email} onChange={e => setFormularioCliente(a => ({ ...a, email: e.target.value }))} placeholder="correo@ejemplo.com" required /></label>
                <label className="reservation-form-field"><span>Teléfono *</span><input type="tel" value={formularioCliente.telefono} onChange={e => setFormularioCliente(a => ({ ...a, telefono: e.target.value }))} placeholder="Número de contacto" required /></label>
                <label className="reservation-form-field"><span>Nacionalidad *</span><input value={formularioCliente.nacionalidad} onChange={e => setFormularioCliente(a => ({ ...a, nacionalidad: e.target.value }))} placeholder="Ej. Peruana" required /></label>
              </div>{errorCliente && <p className="reservation-form-error" role="alert">{errorCliente}</p>}<div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setMostrarModalCliente(false)}>Cancelar</button><button type="submit" className="reservation-save-button">{clienteEnEdicion ? 'Guardar cambios' : 'Registrar cliente'}</button></div></form>
            </section>
          </div>}

          {clienteSeleccionado && (() => {
            const reservasCliente = reservasVisibles.filter(reserva => Number(reserva.cliente_id_cliente) === Number(clienteSeleccionado.id))
            return <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setClienteSeleccionado(null) }}>
              <section className="reservation-detail-modal room-detail-modal" role="dialog" aria-modal="true" aria-labelledby="client-detail-title">
                <div className="reservation-modal-header"><div><span className="reservations-eyebrow">INFORMACIÓN DEL REGISTRO</span><h2 id="client-detail-title">Detalle del cliente: {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}</h2><p>Información personal y reservas relacionadas.</p></div><button type="button" className="reservation-modal-close" onClick={() => setClienteSeleccionado(null)} aria-label="Cerrar ventana">×</button></div>
                <DetailPrimaryKey label="ID_CLIENTE (PK)" value={clienteSeleccionado.id} />
                <div className="reservation-detail-grid client-detail-layout"><article className="reservation-detail-group"><h3>Datos del cliente</h3><div className="client-detail-grid"><div><span>Documento</span><strong>{clienteSeleccionado.documento}</strong></div><div><span>Correo electrónico</span><strong>{clienteSeleccionado.email}</strong></div><div><span>Teléfono</span><strong>{clienteSeleccionado.telefono}</strong></div><div><span>Nacionalidad</span><strong>{clienteSeleccionado.nacionalidad}</strong></div></div>
                </article></div><DetailRelatedRecords title="Reservas asociadas" rows={reservasCliente} emptyMessage="Este cliente todavía no tiene reservas registradas." columns={[
                  { key: 'id_reserva', label: 'ID_RESERVA (PK)', render: reserva => `RES-${String(reserva.id_reserva).padStart(3, '0')}` },
                  { key: 'habitacion', label: 'HABITACIÓN DE LA RESERVA', render: reserva => habitaciones.find(habitacion => Number(habitacion.id) === Number(reserva.habitacion_id_habitacion))?.numero || '—' },
                  { key: 'fecha_entrada', label: 'FECHA DE ENTRADA', render: reserva => reserva.fecha_entrada },
                  { key: 'fecha_salida', label: 'FECHA DE SALIDA', render: reserva => reserva.fecha_salida },
                  { key: 'estado', label: 'ESTADO', render: reserva => reserva.estado },
                ]} />
                <div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setClienteSeleccionado(null)}>Cerrar</button><button type="button" className="reservation-save-button" hidden={!puedeEditarEnModulo('Clientes')} onClick={() => { setClienteSeleccionado(null); abrirEdicionCliente(clienteSeleccionado) }}>Editar cliente</button></div>
              </section>
            </div>
          })()}

          {clientePorEliminar && (() => {
            const relacionadas = reservasVisibles.filter(reserva => Number(reserva.cliente_id_cliente) === Number(clientePorEliminar.id))
            return <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setClientePorEliminar(null) }}><section className="reservation-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="client-delete-title"><div className="reservation-confirm-icon">!</div><h2 id="client-delete-title">{relacionadas.length ? 'No se puede eliminar este cliente' : '¿Eliminar este cliente?'}</h2>{relacionadas.length ? <><p>El cliente <strong>{clientePorEliminar.nombre} {clientePorEliminar.apellido}</strong> tiene reservas asociadas.</p><div className="reservation-confirm-notice"><strong>{relacionadas.length}</strong> reserva(s) dependen de este cliente. No se puede eliminar mientras existan esos registros, para conservar la integridad referencial.</div><div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setClientePorEliminar(null)}>Cerrar</button></div></> : <><p>Estás por eliminar a <strong>{clientePorEliminar.nombre} {clientePorEliminar.apellido}</strong>. Esta acción no se podrá deshacer.</p><div className="reservation-confirm-notice">Solo se permite eliminar clientes que no estén asociados a reservas.</div><div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setClientePorEliminar(null)}>Conservar cliente</button><button type="button" className="reservation-confirm-danger-button" onClick={confirmarEliminarCliente}>Sí, eliminar</button></div></>}</section></div>
          })()}
        </section>
      )
    }

    // MODULO EMPLEADOS
    if (seccionActiva === 'Empleados') {
      const salariosBaseRegistrados = cargos
        .map(cargo => cargo.salario_base)
        .filter(salario => salario !== null && salario !== undefined && salario !== '' && Number.isFinite(Number(salario)))
        .map(Number)
      const promedioSalarioBase = salariosBaseRegistrados.length
        ? salariosBaseRegistrados.reduce((total, salario) => total + salario, 0) / salariosBaseRegistrados.length
        : null
      const salarioBaseMinimo = salariosBaseRegistrados.length ? Math.min(...salariosBaseRegistrados) : null
      const salarioBaseMaximo = salariosBaseRegistrados.length ? Math.max(...salariosBaseRegistrados) : null
      const formatoSalarioCargo = salario => salario === null ? '—' : `S/ ${salario.toFixed(2)}`

      return (
        <section className="rooms-modern-section employees-section">
          <div className="reservations-heading">
            <div className="welcome">
              <span className="reservations-eyebrow">GESTIÓN HOTELERA</span>
              <h1>Gestión de empleados</h1>
              <p>Consulta y administra los empleados registrados en Hotel Los Andes.</p>
            </div>
            <div className="rooms-heading-actions">
              <div className="reservations-heading-note"><span className="reservations-note-icon">▦</span><div><strong>{subseccionEmpleados === 'empleados' ? empleadosDelHotel.length : cargos.length} registros</strong><span>{subseccionEmpleados === 'empleados' ? 'Empleados en el sistema' : 'Cargos en el sistema'}</span></div></div>
            </div>
          </div>

          <div className="rooms-subnav employees-subnav" role="tablist" aria-label="Secciones de empleados">
            <button type="button" role="tab" aria-selected={subseccionEmpleados === 'empleados'} className={subseccionEmpleados === 'empleados' ? 'active' : ''} onClick={() => setSubseccionEmpleados('empleados')}>Empleados</button>
            <button type="button" role="tab" aria-selected={subseccionEmpleados === 'cargos'} className={subseccionEmpleados === 'cargos' ? 'active' : ''} onClick={() => setSubseccionEmpleados('cargos')}>Cargos</button>
          </div>

          {subseccionEmpleados === 'empleados' && <>
          <div className="room-summary rooms-modern-summary employees-modern-summary">
            <article className="room-summary-card reservation-stat reservation-stat-total"><div className="reservation-stat-top"><span>Total de empleados</span><span className="reservation-stat-icon">♙</span></div><h2>{empleadosDelHotel.length}</h2><small>Empleados registrados</small></article>
            <article className="room-summary-card reservation-stat employees-stat-roles"><div className="reservation-stat-top"><span>Cargos asignados</span><span className="reservation-stat-icon">▤</span></div><h2>{new Set(empleados.map(e => e.cargo_id_cargo).filter(Boolean)).size}</h2><small>Funciones registradas</small></article>
            <article className="room-summary-card reservation-stat employees-stat-results"><div className="reservation-stat-top"><span>Empleados encontrados</span><span className="reservation-stat-icon">⌕</span></div><h2>{empleadosFiltrados.length}</h2><small>Coincidencias de búsqueda</small></article>
            <article className="room-summary-card reservation-stat employees-stat-hotels"><div className="reservation-stat-top"><span>Hoteles registrados</span><span className="reservation-stat-icon">▣</span></div><h2>{new Set(empleados.map(e => e.hotel_id_hotel).filter(Boolean)).size}</h2><small>Hoteles con personal</small></article>
          </div>

          <div className="room-list reservations-list rooms-modern-list employees-list">
            <div className="room-list-header reservations-list-header">
              <div><h2>Listado de empleados</h2><p>Administra la información personal del personal registrado.</p></div>
              <div className="reservations-header-actions"><span className="reservations-total-pill">{empleadosFiltrados.length} resultados</span><button type="button" className="reservation-new-button" onClick={abrirRegistroEmpleado}>+ Nuevo empleado</button></div>
            </div>
            <DynamicListFilterPanel title="Empleados" listKey="empleados" searchValue={busquedaEmpleado} searchPlaceholder="Buscar por nombre, documento o fecha de ingreso..." attributes={atributosFiltroEmpleados} activeFilters={obtenerFiltrosActivosLista('empleados')} onSearchChange={valor => actualizarFiltroLista('empleados', setBusquedaEmpleado, valor)} onAddFilter={agregarFiltroAvanzadoLista} onRemoveFilter={quitarFiltroAvanzadoLista} onClearFilters={lista => { setBusquedaEmpleado(''); limpiarFiltrosAvanzadosLista(lista) }} />
<div className="table-container reservations-table-container rooms-modern-table-container">
              <table className="rooms-table rooms-modern-table employees-table">
                <thead><tr><SortableHeader field='id' list='empleados' label='ID' sort={ordenesLista['empleados']} onSort={campo => alternarOrdenLista('empleados', campo)} /><SortableHeader field='nombre' list='empleados' label='NOMBRE' sort={ordenesLista['empleados']} onSort={campo => alternarOrdenLista('empleados', campo)} /><SortableHeader field='apellido' list='empleados' label='APELLIDO' sort={ordenesLista['empleados']} onSort={campo => alternarOrdenLista('empleados', campo)} /><SortableHeader field='documento' list='empleados' label='DOCUMENTO' sort={ordenesLista['empleados']} onSort={campo => alternarOrdenLista('empleados', campo)} /><SortableHeader field='ingreso' list='empleados' label='FECHA DE INGRESO' sort={ordenesLista['empleados']} onSort={campo => alternarOrdenLista('empleados', campo)} /><th className="employee-actions-heading">ACCIONES</th></tr></thead>
                <tbody>
                  {empleadosPagina.rows.map(empleado => (
                    <tr key={empleado.id}>
                      <td>{empleado.id}</td><td><strong className="employee-name">{empleado.nombre}</strong></td><td>{empleado.apellido}</td><td>{empleado.documento}</td><td>{empleado.fechaIngreso || '—'}</td>
                      <td className="reservation-action-cell employee-action-cell"><div className="reservation-row-actions employee-row-actions"><button type="button" className="reservation-detail-button" onClick={() => setEmpleadoSeleccionado(empleado)}>Ver detalle</button><button type="button" className="reservation-edit-button" onClick={() => abrirEdicionEmpleado(empleado)}>Editar</button><button type="button" className="reservation-cancel-record-button" onClick={() => setEmpleadoPorEliminar(empleado)}>Eliminar</button></div></td>
                    </tr>
                  ))}
                  {empleadosFiltrados.length === 0 && <tr><td colSpan="6" className="empty-message">No se encontraron empleados con ese criterio.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="reservations-list-footer"><span>Mostrando {empleadosFiltrados.length} de {empleadosDelHotel.length} empleados</span><span>Tabla EMPLEADO del modelo relacional</span></div>
              <ListPagination totalItems={empleadosFiltrados.length} {...empleadosPagina} onPageChange={pagina => cambiarPaginaLista('empleados', pagina)} onPageSizeChange={tamano => cambiarTamanoPaginaLista('empleados', tamano)} />
          </div>

          </>}

          {subseccionEmpleados === 'cargos' && (
            <>
            <div className="room-summary rooms-modern-summary employees-modern-summary">
              <article className="room-summary-card reservation-stat reservation-stat-total"><div className="reservation-stat-top"><span>Total de cargos</span><span className="reservation-stat-icon">▦</span></div><h2>{cargos.length}</h2><small>Cargos registrados</small></article>
              <article className="room-summary-card reservation-stat employees-stat-roles"><div className="reservation-stat-top"><span>Salario base promedio</span><span className="reservation-stat-icon">S/</span></div><h2>{formatoSalarioCargo(promedioSalarioBase)}</h2><small>Entre salarios informados</small></article>
              <article className="room-summary-card reservation-stat employees-stat-results"><div className="reservation-stat-top"><span>Salario base mínimo</span><span className="reservation-stat-icon">↓</span></div><h2>{formatoSalarioCargo(salarioBaseMinimo)}</h2><small>Mínimo registrado</small></article>
              <article className="room-summary-card reservation-stat employees-stat-hotels"><div className="reservation-stat-top"><span>Salario base máximo</span><span className="reservation-stat-icon">↑</span></div><h2>{formatoSalarioCargo(salarioBaseMaximo)}</h2><small>Máximo registrado</small></article>
            </div>
            <div className="room-list reservations-list employees-list cargos-list">
              <div className="room-list-header reservations-list-header">
                <div><h2>Listado de cargos</h2><p>Administra los cargos y salarios base registrados en el hotel.</p></div>
                <div className="reservations-header-actions"><span className="reservations-total-pill">{cargosFiltrados.length} resultados</span><button type="button" className="reservation-new-button" onClick={abrirRegistroCargo}>＋ Nuevo cargo</button></div>
              </div>
              <DynamicListFilterPanel title="Cargos" listKey="cargos" searchValue={busquedaCargo} searchPlaceholder="Buscar por nombre de cargo..." attributes={atributosFiltroCargos} activeFilters={obtenerFiltrosActivosLista('cargos')} onSearchChange={valor => actualizarFiltroLista('cargos', setBusquedaCargo, valor)} onAddFilter={agregarFiltroAvanzadoLista} onRemoveFilter={quitarFiltroAvanzadoLista} onClearFilters={lista => { setBusquedaCargo(''); limpiarFiltrosAvanzadosLista(lista) }} />
<div className="table-container reservations-table-container rooms-modern-table-container">
                <table className="rooms-table rooms-modern-table cargos-table">
                  <thead><tr><SortableHeader field='id' list='cargos' label='ID' sort={ordenesLista['cargos']} onSort={campo => alternarOrdenLista('cargos', campo)} /><SortableHeader field='nombre' list='cargos' label='NOMBRE DEL CARGO' sort={ordenesLista['cargos']} onSort={campo => alternarOrdenLista('cargos', campo)} /><SortableHeader field='salario' list='cargos' label='SALARIO BASE' sort={ordenesLista['cargos']} onSort={campo => alternarOrdenLista('cargos', campo)} /><th className="cargo-actions-heading">ACCIONES</th></tr></thead>
                  <tbody>{cargosPagina.rows.map(cargo => (
                    <tr key={cargo.id_cargo}>
                      <td>{cargo.id_cargo}</td>
                      <td><strong className="employee-name">{cargo.nombre}</strong></td>
                      <td>{cargo.salario_base == null ? 'No registrado' : `S/ ${Number(cargo.salario_base).toFixed(2)}`}</td>
                      <td className="reservation-action-cell cargo-action-cell"><div className="reservation-row-actions cargo-row-actions"><button type="button" className="reservation-detail-button" onClick={() => setCargoSeleccionado(cargo)} aria-label={`Ver detalle del cargo ${cargo.nombre}`}>Ver detalle</button><button type="button" className="reservation-edit-button" onClick={() => abrirEdicionCargo(cargo)}>Editar</button><button type="button" className="reservation-cancel-record-button" onClick={() => setCargoPorEliminar(cargo)}>Eliminar</button></div></td>
                    </tr>
                  ))}{cargosFiltrados.length === 0 && <tr><td colSpan="3" className="empty-message">No se encontraron cargos con ese criterio.</td></tr>}</tbody>
                </table>
              </div>
              <div className="reservations-list-footer"><span>Mostrando {cargosFiltrados.length} de {cargos.length} cargos</span><span>Tabla CARGO del modelo relacional</span></div>
              <ListPagination totalItems={cargosFiltrados.length} {...cargosPagina} onPageChange={pagina => cambiarPaginaLista('cargos', pagina)} onPageSizeChange={tamano => cambiarTamanoPaginaLista('cargos', tamano)} />
            </div>
            </>
          )}

          {mostrarModalCargo && (
            <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setMostrarModalCargo(false) }}>
              <section className="reservation-modal room-create-modal" role="dialog" aria-modal="true" aria-labelledby="cargo-form-title">
                <div className="reservation-modal-header"><div><span className="reservations-eyebrow">{cargoEnEdicion ? 'ACTUALIZAR REGISTRO' : 'NUEVO REGISTRO'}</span><h2 id="cargo-form-title">{cargoEnEdicion ? 'Editar cargo' : 'Registrar cargo'}</h2><p>Completa los atributos de la tabla CARGO.</p></div><button type="button" className="reservation-modal-close" onClick={() => setMostrarModalCargo(false)} aria-label="Cerrar ventana">×</button></div>
                <form onSubmit={guardarCargo}><div className="reservation-form-grid">
                  <label className="reservation-form-field"><span>Nombre del cargo *</span><input type="text" maxLength="100" placeholder="Ej. Recepcionista" value={formularioCargo.nombre} onChange={e => setFormularioCargo(actual => ({ ...actual, nombre: e.target.value }))} required /></label>
                  <label className="reservation-form-field"><span>Salario base (S/)</span><input type="number" min="0" step="0.01" placeholder="Opcional" value={formularioCargo.salario_base} onChange={e => setFormularioCargo(actual => ({ ...actual, salario_base: e.target.value }))} /></label>
                </div>{errorCargo && <p className="reservation-form-error" role="alert">{errorCargo}</p>}<div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setMostrarModalCargo(false)}>Cancelar</button><button type="submit" className="reservation-save-button">{cargoEnEdicion ? 'Guardar cambios' : 'Registrar cargo'}</button></div></form>
              </section>
            </div>
          )}

          {cargoSeleccionado && (() => {
            const empleadosDelCargo = empleados.filter(empleado => Number(empleado.cargo_id_cargo) === Number(cargoSeleccionado.id_cargo))
            return (
              <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setCargoSeleccionado(null) }}>
                <section className="reservation-detail-modal room-detail-modal employee-detail-modal" role="dialog" aria-modal="true" aria-labelledby="cargo-detail-title">
                  <div className="reservation-modal-header">
                    <div><span className="reservations-eyebrow">INFORMACIÓN DEL REGISTRO</span><h2 id="cargo-detail-title">Detalle del cargo {cargoSeleccionado.nombre}</h2><p>Información correspondiente a la tabla CARGO y sus empleados relacionados.</p></div>
                    <button type="button" className="reservation-modal-close" onClick={() => setCargoSeleccionado(null)} aria-label="Cerrar detalle">×</button>
                  </div>
                  <DetailPrimaryKey label="ID_CARGO (PK)" value={cargoSeleccionado.id_cargo} />
                  <div className="reservation-detail-grid cargo-detail-grid">
                    <article className="reservation-detail-group"><h3>Datos del cargo</h3>
                      <div className="reservation-detail-item"><span>Nombre</span><strong>{cargoSeleccionado.nombre}</strong></div>
                      <div className="reservation-detail-item"><span>Salario base</span><strong>{cargoSeleccionado.salario_base != null ? `S/ ${Number(cargoSeleccionado.salario_base).toFixed(2)}` : 'No registrado'}</strong></div>
                    </article>
                  </div>
                  <DetailRelatedRecords title="Empleados asignados" rows={empleadosDelCargo} emptyMessage="Actualmente no hay empleados asignados a este cargo." columns={[
                    { key: 'id', label: 'ID_EMPLEADO (PK)', render: empleado => empleado.id },
                    { key: 'nombre', label: 'NOMBRE', render: empleado => empleado.nombre },
                    { key: 'apellido', label: 'APELLIDO', render: empleado => empleado.apellido },
                    { key: 'documento', label: 'DOCUMENTO', render: empleado => empleado.documento },
                    { key: 'fecha_ingreso', label: 'FECHA_INGRESO', render: empleado => empleado.fecha_ingreso ?? empleado.fechaIngreso ?? 'No registrado' },
                  ]} />
                  <div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setCargoSeleccionado(null)}>Cerrar</button><button type="button" className="reservation-save-button" onClick={() => { const cargo = cargoSeleccionado; setCargoSeleccionado(null); abrirEdicionCargo(cargo) }}>Editar cargo</button></div>
                </section>
              </div>
            )
          })()}

          {cargoPorEliminar && (() => {
            const asignados = empleados.filter(empleado => Number(empleado.cargo_id_cargo) === Number(cargoPorEliminar.id_cargo))
            return <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setCargoPorEliminar(null) }}><section className="reservation-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="cargo-delete-title"><div className="reservation-confirm-icon">!</div><h2 id="cargo-delete-title">{asignados.length ? 'No se puede eliminar este cargo' : '¿Eliminar este cargo?'}</h2>{asignados.length ? <><p>El cargo <strong>{cargoPorEliminar.nombre}</strong> está asignado a empleados registrados.</p><div className="reservation-confirm-notice"><strong>{asignados.length}</strong> empleado(s) dependen de este cargo. Primero reasigna esos empleados a otro cargo para conservar la integridad referencial.</div><div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setCargoPorEliminar(null)}>Cerrar</button></div></> : <><p>Estás por eliminar el cargo <strong>{cargoPorEliminar.nombre}</strong>. Esta acción no se podrá deshacer.</p><div className="reservation-confirm-notice">Solo se permite eliminar cargos que no estén asignados a empleados.</div><div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setCargoPorEliminar(null)}>Conservar cargo</button><button type="button" className="reservation-confirm-danger-button" onClick={confirmarEliminarCargo}>Sí, eliminar</button></div></>}</section></div>
          })()}

          {mostrarModalEmpleado && (
            <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setMostrarModalEmpleado(false) }}>
              <section className="reservation-modal room-create-modal" role="dialog" aria-modal="true" aria-labelledby="employee-form-title">
                <div className="reservation-modal-header"><div><span className="reservations-eyebrow">{empleadoEnEdicion ? 'ACTUALIZAR REGISTRO' : 'NUEVO REGISTRO'}</span><h2 id="employee-form-title">{empleadoEnEdicion ? 'Editar empleado' : 'Registrar empleado'}</h2><p>Completa los atributos de la tabla EMPLEADO.</p></div><button type="button" className="reservation-modal-close" onClick={() => setMostrarModalEmpleado(false)} aria-label="Cerrar ventana">×</button></div>
                <form onSubmit={guardarEmpleado}><div className="reservation-form-grid">
                  <label className="reservation-form-field"><span>Nombre *</span><input type="text" value={formularioEmpleado.nombre} onChange={e => setFormularioEmpleado(a => ({ ...a, nombre: e.target.value }))} placeholder="Ej. Andrea" required /></label>
                  <label className="reservation-form-field"><span>Apellido *</span><input type="text" value={formularioEmpleado.apellido} onChange={e => setFormularioEmpleado(a => ({ ...a, apellido: e.target.value }))} placeholder="Ej. Ramírez" required /></label>
                  <label className="reservation-form-field"><span>Documento *</span><input type="text" inputMode="numeric" maxLength="15" value={formularioEmpleado.documento} onChange={e => setFormularioEmpleado(a => ({ ...a, documento: e.target.value.replace(/[^0-9]/g, '') }))} placeholder="Número de documento" required /></label>
                  <label className="reservation-form-field"><span>Fecha de ingreso</span><input type="date" value={formularioEmpleado.fechaIngreso} onChange={e => setFormularioEmpleado(a => ({ ...a, fechaIngreso: e.target.value }))} /></label>
                  <label className="reservation-form-field"><span>Cargo *</span><select value={formularioEmpleado.cargo_id_cargo} onChange={e => setFormularioEmpleado(a => ({ ...a, cargo_id_cargo: e.target.value }))} required><option value="">Selecciona un cargo</option>{cargos.map(cargo => <option key={cargo.id_cargo} value={cargo.id_cargo}>{cargo.nombre}</option>)}</select></label>
                  <label className="reservation-form-field"><span>Hotel relacionado (FK) *</span><select value={formularioEmpleado.hotel_id_hotel} onChange={e => setFormularioEmpleado(a => ({ ...a, hotel_id_hotel: e.target.value }))} required><option value="">Selecciona un hotel</option>{hoteles.map(hotel => <option key={hotel.id_hotel} value={hotel.id_hotel}>{hotel.nombre}</option>)}</select></label>
                </div>{errorEmpleado && <p className="reservation-form-error" role="alert">{errorEmpleado}</p>}<div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setMostrarModalEmpleado(false)}>Cancelar</button><button type="submit" className="reservation-save-button">{empleadoEnEdicion ? 'Guardar cambios' : 'Registrar empleado'}</button></div></form>
              </section>
            </div>
          )}

          {empleadoSeleccionado && (() => {
            const cargoDetalle = obtenerCargoEmpleado(empleadoSeleccionado)
            const hotelDetalle = obtenerHotelEmpleado(empleadoSeleccionado)
            const estadiasEmpleado = estadiasVisibles.filter(estadia => Number(estadia.empleado_id_empleado) === Number(empleadoSeleccionado.id))
            const mantenimientosEmpleado = mantenimientos.filter(mantenimiento => Number(mantenimiento.empleado_id_empleado) === Number(empleadoSeleccionado.id))
            const mostrarDato = valor => valor !== null && valor !== undefined && valor !== '' ? valor : 'No registrado'
            return (
              <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setEmpleadoSeleccionado(null) }}>
                <section className="reservation-detail-modal room-detail-modal employee-detail-modal detail-wide-modal" role="dialog" aria-modal="true" aria-labelledby="employee-detail-title">
                  <div className="reservation-modal-header">
                    <div>
                      <span className="reservations-eyebrow">INFORMACIÓN DEL REGISTRO</span>
                      <h2 id="employee-detail-title">Detalle del empleado {empleadoSeleccionado.nombre} {empleadoSeleccionado.apellido}</h2>
                      <p>Información de las entidades relacionadas y de la tabla EMPLEADO.</p>
                    </div>
                    <button type="button" className="reservation-modal-close" onClick={() => setEmpleadoSeleccionado(null)} aria-label="Cerrar detalle">×</button>
                  </div>

                  <DetailPrimaryKey label="ID_EMPLEADO (PK)" value={empleadoSeleccionado.id} />

                  <div className="reservation-detail-grid">
                    <article className="reservation-detail-group">
                      <h3>Datos del hotel</h3>
                      <div className="reservation-detail-item"><span>HOTEL_ID_HOTEL (FK)</span><strong>{mostrarDato(hotelDetalle?.id_hotel ?? empleadoSeleccionado.hotel_id_hotel)}</strong></div>
                      <div className="reservation-detail-item"><span>Nombre</span><strong>{mostrarDato(hotelDetalle?.nombre)}</strong></div>
                      <div className="reservation-detail-item"><span>Dirección</span><strong>{mostrarDato(hotelDetalle?.direccion)}</strong></div>
                      <div className="reservation-detail-item"><span>Ciudad</span><strong>{mostrarDato(hotelDetalle?.ciudad)}</strong></div>
                      <div className="reservation-detail-item"><span>País</span><strong>{mostrarDato(hotelDetalle?.pais)}</strong></div>
                      <div className="reservation-detail-item"><span>Teléfono</span><strong>{mostrarDato(hotelDetalle?.telefono)}</strong></div>
                      <div className="reservation-detail-item"><span>Email</span><strong>{mostrarDato(hotelDetalle?.email)}</strong></div>
                      <div className="reservation-detail-item"><span>Categoría</span><strong>{mostrarDato(hotelDetalle?.categoria)}</strong></div>
                    </article>

                    <article className="reservation-detail-group">
                      <h3>Datos del cargo</h3>
                      <div className="reservation-detail-item"><span>CARGO_ID_CARGO (FK)</span><strong>{mostrarDato(cargoDetalle?.id_cargo ?? empleadoSeleccionado.cargo_id_cargo)}</strong></div>
                      <div className="reservation-detail-item"><span>Nombre del cargo</span><strong>{mostrarDato(cargoDetalle?.nombre)}</strong></div>
                      <div className="reservation-detail-item"><span>Salario base</span><strong>{cargoDetalle?.salario_base != null ? `S/ ${Number(cargoDetalle.salario_base).toFixed(2)}` : 'No registrado'}</strong></div>
                    </article>

                    <article className="reservation-detail-group">
                      <h3>Datos del empleado</h3>
                      <div className="reservation-detail-grid employee-own-data-grid">
                        <div className="reservation-detail-item"><span>Nombre</span><strong>{empleadoSeleccionado.nombre}</strong></div>
                        <div className="reservation-detail-item"><span>Apellido</span><strong>{empleadoSeleccionado.apellido}</strong></div>
                        <div className="reservation-detail-item"><span>Documento</span><strong>{empleadoSeleccionado.documento}</strong></div>
                        <div className="reservation-detail-item"><span>Fecha de ingreso</span><strong>{empleadoSeleccionado.fechaIngreso ? formatearFechaReserva(empleadoSeleccionado.fechaIngreso) : 'No registrada'}</strong></div>
                      </div>
                    </article>
                  </div>

                  <DetailRelatedRecords title="Estadías asignadas" rows={estadiasEmpleado} emptyMessage="Este empleado todavía no tiene estadías asignadas." columns={[
                    { key: 'id_estadia', label: 'ID_ESTADIA (PK)', render: row => row.id_estadia },
                    { key: 'fecha_check_in', label: 'FECHA_CHECK_IN', render: row => formatearFechaReserva(row.fecha_check_in) },
                    { key: 'fecha_check_out', label: 'FECHA_CHECK_OUT', render: row => formatearFechaReserva(row.fecha_check_out) },
                  ]} />
                  <DetailRelatedRecords title="Mantenimientos asignados" rows={mantenimientosEmpleado} emptyMessage="Este empleado todavía no tiene mantenimientos asignados." columns={[
                    { key: 'id_mantenimiento', label: 'ID_MANTENIMIENTO', render: row => row.id_mantenimiento },
                    { key: 'fecha_inicio', label: 'FECHA_INICIO', render: row => formatearFechaReserva(row.fecha_inicio) },
                    { key: 'tipo', label: 'TIPO', render: row => row.tipo },
                    { key: 'costo', label: 'COSTO', render: row => formatearMontoReserva(row.costo) },
                  ]} />

                  <div className="reservation-modal-footer">
                    <button type="button" className="reservation-cancel-button" onClick={() => setEmpleadoSeleccionado(null)}>Cerrar detalle</button>
                    <button type="button" className="reservation-save-button" onClick={() => { const actual = empleadoSeleccionado; setEmpleadoSeleccionado(null); abrirEdicionEmpleado(actual) }}>Editar empleado</button>
                  </div>
                </section>
              </div>
            )
          })()}

          {empleadoPorEliminar && (() => {
            const estadiasRelacionadas = estadiasVisibles.filter(estadia => Number(estadia.empleado_id_empleado) === Number(empleadoPorEliminar.id))
            const mantenimientosRelacionados = mantenimientos.filter(mantenimiento => Number(mantenimiento.empleado_id_empleado) === Number(empleadoPorEliminar.id))
            const tieneRelaciones = estadiasRelacionadas.length > 0 || mantenimientosRelacionados.length > 0
            return <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setEmpleadoPorEliminar(null) }}><section className="reservation-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="employee-delete-title"><div className="reservation-confirm-icon">!</div><h2 id="employee-delete-title">{tieneRelaciones ? 'No se puede eliminar este empleado' : '¿Eliminar este empleado?'}</h2>{tieneRelaciones ? <><p><strong>{empleadoPorEliminar.nombre} {empleadoPorEliminar.apellido}</strong> aparece asociado a estos registros:</p><div className="reservation-confirm-notice">{estadiasRelacionadas.length > 0 && <div><strong>{estadiasRelacionadas.length}</strong> estadía(s) asociada(s).</div>}{mantenimientosRelacionados.length > 0 && <div><strong>{mantenimientosRelacionados.length}</strong> mantenimiento(s) asociado(s).</div>}Actualiza o elimina esos registros antes de quitar al empleado.</div><div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setEmpleadoPorEliminar(null)}>Cerrar</button></div></> : <><p>Estás por eliminar a <strong>{empleadoPorEliminar.nombre} {empleadoPorEliminar.apellido}</strong>. Esta acción no se podrá deshacer.</p><div className="reservation-confirm-notice">El registro se quitará de la lista de empleados.</div><div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setEmpleadoPorEliminar(null)}>Conservar empleado</button><button type="button" className="reservation-confirm-danger-button" onClick={confirmarEliminarEmpleado}>Sí, eliminar</button></div></>}</section></div>
          })()}
        </section>
      )
    }

    // ========================================
    // MODULO SERVICIOS
    // ========================================

    if (seccionActiva === 'Consumos') {
      if (subseccionServicios === 'consumos') {
        return (
          <section className="rooms-section rooms-modern-section services-section">
            <div className="reservations-heading">
              <div className="welcome">
                <span className="reservations-eyebrow">GESTIÓN HOTELERA</span>
                <h1>Gestión de consumos</h1>
                <p>Administra los consumos de servicios asociados a las estadías.</p>
              </div>
              <div className="rooms-heading-actions"><div className="reservations-heading-note"><span className="reservations-note-icon">▦</span><div><strong>{consumosVisibles.length} registros</strong><span>Consumos en el sistema</span></div></div></div>
            </div>

            <div className="services-subnav" role="tablist" aria-label="Pestañas de Consumos y Servicios">
              <button type="button" className="services-subnav-button active" aria-current="page" onClick={() => setSubseccionServicios('consumos')}>Consumos</button>
              <button type="button" className="services-subnav-button" onClick={() => setSubseccionServicios('servicios')}>Servicios</button>
            </div>


          <div className="room-summary rooms-modern-summary services-modern-summary">
              <article className="room-summary-card reservation-stat reservation-stat-total"><div className="reservation-stat-top"><span>Total de consumos</span><span className="reservation-stat-icon">▤</span></div><h2>{consumosVisibles.length}</h2><small>Registros de consumo</small></article>
              <article className="room-summary-card reservation-stat services-stat-average"><div className="reservation-stat-top"><span>Unidades consumidas</span><span className="reservation-stat-icon">#</span></div><h2>{consumosServicios.reduce((total, consumo) => total + Number(consumo.cantidad || 0), 0)}</h2><small>Suma de cantidades</small></article>
              <article className="room-summary-card reservation-stat services-stat-cheapest"><div className="reservation-stat-top"><span>Importe acumulado</span><span className="reservation-stat-icon">S/</span></div><h2>S/ {consumosServicios.reduce((total, consumo) => total + Number(consumo.subtotal || 0), 0).toFixed(2)}</h2><small>Suma de subtotales</small></article>
              <article className="room-summary-card reservation-stat services-stat-results"><div className="reservation-stat-top"><span>Resultados encontrados</span><span className="reservation-stat-icon">⌕</span></div><h2>{consumosFiltrados.length}</h2><small>Coincidencias de búsqueda</small></article>
            </div>

            <div className="room-list reservations-list rooms-modern-list services-list">
              <div className="room-list-header reservations-list-header">
                <div><h2>Listado de consumos</h2><p>Registros de la tabla CONSUMO_SERVICIO.</p></div>
                <div className="reservations-header-actions"><span className="reservations-total-pill">{consumosFiltrados.length} resultados</span><button type="button" className="reservation-new-button" hidden={!puedeCrearEnModulo('Consumos')} onClick={abrirRegistroConsumo} disabled={estadiasVisibles.length === 0} title={estadiasVisibles.length === 0 ? 'Primero registra una estadía para poder asociar un consumo.' : 'Registrar consumo'}>＋ Nuevo consumo</button></div>
              </div>
              <DynamicListFilterPanel title="Consumos" listKey="consumos" searchValue={busquedaConsumo} searchPlaceholder="Buscar por ID, estadía, servicio, cantidad o subtotal..." attributes={atributosFiltroConsumos} activeFilters={obtenerFiltrosActivosLista('consumos')} onSearchChange={valor => actualizarFiltroLista('consumos', setBusquedaConsumo, valor)} onAddFilter={agregarFiltroAvanzadoLista} onRemoveFilter={quitarFiltroAvanzadoLista} onClearFilters={lista => { setBusquedaConsumo(''); limpiarFiltrosAvanzadosLista(lista) }} />
<div className="table-container reservations-table-container rooms-modern-table-container">
                <table className="rooms-table rooms-modern-table services-table consumption-table">
                  <thead><tr><SortableHeader field='id' list='consumos' label='ID_CONSUMO' sort={ordenesLista['consumos']} onSort={campo => alternarOrdenLista('consumos', campo)} /><SortableHeader field='cantidad' list='consumos' label='CANTIDAD' sort={ordenesLista['consumos']} onSort={campo => alternarOrdenLista('consumos', campo)} /><SortableHeader field='subtotal' list='consumos' label='SUBTOTAL' sort={ordenesLista['consumos']} onSort={campo => alternarOrdenLista('consumos', campo)} /><th className="reservation-action-heading">ACCIONES</th></tr></thead>
                  <tbody>
                    {consumosPagina.rows.map(consumo => {
                     return <tr key={consumo.id_consumo}><td>{consumo.id_consumo}</td><td>{consumo.cantidad}</td><td>S/ {Number(consumo.subtotal).toFixed(2)}</td><td className="reservation-action-cell"><div className="reservation-row-actions"><button type="button" className="reservation-detail-button" onClick={() => setConsumoSeleccionado(consumo)}>Ver detalle</button><button type="button" className="reservation-edit-button" hidden={!puedeEditarEnModulo('Consumos')} onClick={() => abrirEdicionConsumo(consumo)}>Editar</button><button type="button" className="reservation-cancel-record-button" hidden={!puedeEliminarEnModulo()} onClick={() => setConsumoPorEliminar(consumo)}>Eliminar</button></div></td></tr>
                    })}
                    {consumosFiltrados.length === 0 && <tr><td colSpan="4" className="empty-message">{busquedaConsumo ? 'No se encontraron consumos con ese criterio.' : 'Todavía no hay consumos registrados en CONSUMO_SERVICIO.'}</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="reservations-list-footer"><span>Mostrando {consumosFiltrados.length} de {consumosVisibles.length} consumos</span><span>Tabla CONSUMO_SERVICIO del modelo relacional</span></div>
              <ListPagination totalItems={consumosFiltrados.length} {...consumosPagina} onPageChange={pagina => cambiarPaginaLista('consumos', pagina)} onPageSizeChange={tamano => cambiarTamanoPaginaLista('consumos', tamano)} />
              {estadiasVisibles.length === 0 && <p className="consumption-dependency-note">Para registrar un consumo primero deben existir registros en ESTADIA. El formulario y la relación con SERVICIO ya están preparados, pero no se habilita el alta para evitar claves foráneas inválidas.</p>}
            </div>

            {mostrarModalConsumo && <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setMostrarModalConsumo(false) }}><section className="reservation-modal room-create-modal" role="dialog" aria-modal="true" aria-labelledby="consumption-form-title"><div className="reservation-modal-header"><div><span className="reservations-eyebrow">{consumoEnEdicion ? 'ACTUALIZAR REGISTRO' : 'NUEVO REGISTRO'}</span><h2 id="consumption-form-title">{consumoEnEdicion ? 'Editar consumo' : 'Registrar consumo'}</h2><p>Completa los atributos y las claves foráneas de CONSUMO_SERVICIO.</p></div><button type="button" className="reservation-modal-close" onClick={() => setMostrarModalConsumo(false)} aria-label="Cerrar ventana">×</button></div><form onSubmit={guardarConsumo}><div className="reservation-form-grid">
              <label className="reservation-form-field"><span>Estadía (FK) *</span><select value={formularioConsumo.estadia_id_estadia} onChange={e => setFormularioConsumo(actual => ({ ...actual, estadia_id_estadia: e.target.value }))} required><option value="">Seleccionar estadía</option>{estadiasVisibles.map(estadia => <option key={estadia.id_estadia} value={estadia.id_estadia}>Estadía #{estadia.id_estadia}</option>)}</select></label>
              <label className="reservation-form-field"><span>Servicio (FK) *</span><select value={formularioConsumo.servicio_id_servicio} onChange={e => { const servicioId = e.target.value; const servicio = serviciosVisibles.find(item => Number(item.id) === Number(servicioId)); setFormularioConsumo(actual => ({ ...actual, servicio_id_servicio: servicioId, subtotal: servicio && actual.cantidad ? (Number(servicio.precio) * Number(actual.cantidad)).toFixed(2) : actual.subtotal })) }} required><option value="">Seleccionar servicio</option>{serviciosVisibles.map(servicio => <option key={servicio.id} value={servicio.id}>{servicio.nombre} — S/ {Number(servicio.precio).toFixed(2)}</option>)}</select></label>
              <label className="reservation-form-field"><span>Cantidad *</span><input type="number" min="1" step="1" value={formularioConsumo.cantidad} onChange={e => { const cantidad = e.target.value; const servicio = serviciosVisibles.find(item => Number(item.id) === Number(formularioConsumo.servicio_id_servicio)); setFormularioConsumo(actual => ({ ...actual, cantidad, subtotal: servicio && cantidad ? (Number(servicio.precio) * Number(cantidad)).toFixed(2) : actual.subtotal })) }} required /></label>
              <label className="reservation-form-field"><span>Subtotal (S/) *</span><input type="number" min="0" step="0.01" value={formularioConsumo.subtotal} onChange={e => setFormularioConsumo(actual => ({ ...actual, subtotal: e.target.value }))} required /></label>
            </div>{errorConsumo && <p className="reservation-form-error" role="alert">{errorConsumo}</p>}<div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setMostrarModalConsumo(false)}>Cancelar</button><button type="submit" className="reservation-save-button">{consumoEnEdicion ? 'Guardar cambios' : 'Registrar consumo'}</button></div></form></section></div>}

            {consumoSeleccionado && (() => {
              const servicio = serviciosVisibles.find(item => Number(item.id) === Number(consumoSeleccionado.servicio_id_servicio))
              const estadia = estadias.find(item => Number(item.id_estadia) === Number(consumoSeleccionado.estadia_id_estadia))
              const reserva = estadia ? obtenerReservaEstadia(estadia) : null
              const empleado = estadia ? obtenerEmpleadoEstadia(estadia) : null
              const habitacion = reserva ? obtenerHabitacionReserva(reserva) : null
              return <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setConsumoSeleccionado(null) }}>
                <section className="reservation-detail-modal room-detail-modal consumption-detail-modal" role="dialog" aria-modal="true" aria-labelledby="consumption-detail-title">
                  <div className="reservation-modal-header"><div><span className="reservations-eyebrow">INFORMACIÓN DEL REGISTRO</span><h2 id="consumption-detail-title">Detalle del consumo</h2><p>Información correspondiente a la tabla CONSUMO_SERVICIO y sus entidades relacionadas.</p></div><button type="button" className="reservation-modal-close" onClick={() => setConsumoSeleccionado(null)} aria-label="Cerrar detalle">×</button></div>
                  <DetailPrimaryKey label="ID_CONSUMO (PK)" value={consumoSeleccionado.id_consumo} />
                  <div className="reservation-detail-grid">
                    <article className="reservation-detail-group"><h3>Datos del consumo</h3><div className="reservation-detail-item"><span>CANTIDAD</span><strong>{consumoSeleccionado.cantidad}</strong></div><div className="reservation-detail-item"><span>SUBTOTAL</span><strong>S/ {Number(consumoSeleccionado.subtotal).toFixed(2)}</strong></div></article>
                    <article className="reservation-detail-group"><h3>Datos del servicio relacionado</h3><div className="reservation-detail-item"><span>SERVICIO_ID_SERVICIO (FK)</span><strong>{consumoSeleccionado.servicio_id_servicio}</strong></div><div className="reservation-detail-item"><span>Nombre</span><strong>{servicio?.nombre ?? 'No encontrado'}</strong></div><div className="reservation-detail-item"><span>Precio unitario</span><strong>{servicio ? `S/ ${Number(servicio.precio).toFixed(2)}` : 'No encontrado'}</strong></div></article>
                    <article className="reservation-detail-group"><h3>Estadía relacionada</h3>{estadia ? <><div className="reservation-detail-item"><span>ESTADIA_ID_ESTADIA (FK)</span><strong>{consumoSeleccionado.estadia_id_estadia}</strong></div><div className="reservation-detail-item"><span>Fecha de check-in</span><strong>{formatearFechaReserva(estadia.fecha_check_in)}</strong></div><div className="reservation-detail-item"><span>Fecha de check-out</span><strong>{formatearFechaReserva(estadia.fecha_check_out)}</strong></div><div className="reservation-detail-item"><span>RESERVA_ID_RESERVA (FK)</span><strong>{estadia.reserva_id_reserva ?? reserva?.id_reserva ?? 'No encontrada'}</strong></div><div className="reservation-detail-item"><span>Cliente</span><strong>{reserva ? nombreClienteReserva(reserva) : 'No encontrado'}</strong></div><div className="reservation-detail-item"><span>Habitación</span><strong>{habitacion ? `N.º ${habitacion.numero}` : 'No encontrada'}</strong></div><div className="reservation-detail-item"><span>EMPLEADO_ID_EMPLEADO (FK)</span><strong>{empleado?.id ?? estadia.empleado_id_empleado ?? 'No registrado'}</strong></div><div className="reservation-detail-item"><span>Empleado responsable</span><strong>{empleado ? `${empleado.nombre} ${empleado.apellido}` : 'No encontrado'}</strong></div></> : <p className="empty-message">No se encontró una estadía asociada a este consumo.</p>}</article>
                  </div>
                  <div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setConsumoSeleccionado(null)}>Cerrar</button>{puedeEditarEnModulo('Consumos') && <button type="button" className="reservation-save-button" onClick={() => { const item = consumoSeleccionado; setConsumoSeleccionado(null); abrirEdicionConsumo(item) }}>Editar consumo</button>}</div>
                </section>
              </div>
            })()}
            {consumoPorEliminar && <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setConsumoPorEliminar(null) }}><section className="reservation-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="consumption-delete-title"><div className="reservation-confirm-icon">!</div><h2 id="consumption-delete-title">¿Eliminar este consumo?</h2><p>Se eliminará el consumo <strong>#{consumoPorEliminar.id_consumo}</strong>. Esta acción no se podrá deshacer.</p><div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setConsumoPorEliminar(null)}>Conservar</button><button type="button" className="reservation-confirm-danger-button" onClick={confirmarEliminarConsumo}>Sí, eliminar</button></div></section></div>}
          </section>
        )
      }
      return (
        <section className="rooms-section rooms-modern-section services-section">
          <div className="reservations-heading">
            <div className="welcome">
              <span className="reservations-eyebrow">GESTIÓN HOTELERA</span>
              <h1>Gestión de servicios</h1>
              <p>Consulta y administra los servicios registrados en el hotel.</p>
            </div>
            <div className="rooms-heading-actions">
              <div className="reservations-heading-note"><span className="reservations-note-icon">▦</span><div><strong>{serviciosVisibles.length} registros</strong><span>Servicios en el sistema</span></div></div>
            </div>
          </div>

          <div className="services-subnav" role="tablist" aria-label="Pestañas de Consumos y Servicios">
            <button type="button" className="services-subnav-button" onClick={() => setSubseccionServicios('consumos')}>Consumos</button>
            <button type="button" className="services-subnav-button active" aria-current="page" onClick={() => setSubseccionServicios('servicios')}>Servicios</button>
          </div>

          <div className="room-summary rooms-modern-summary services-modern-summary">
            <article className="room-summary-card reservation-stat reservation-stat-total"><div className="reservation-stat-top"><span>Total de servicios</span><span className="reservation-stat-icon">▤</span></div><h2>{serviciosVisibles.length}</h2><small>Servicios registrados</small></article>
            <article className="room-summary-card reservation-stat services-stat-average"><div className="reservation-stat-top"><span>Precio promedio</span><span className="reservation-stat-icon">S/</span></div><h2>S/ {(servicios.reduce((total, servicio) => total + Number(servicio.precio), 0) / (serviciosVisibles.length || 1)).toFixed(2)}</h2><small>Promedio de precios</small></article>
            <article className="room-summary-card reservation-stat services-stat-cheapest"><div className="reservation-stat-top"><span>Servicio más económico</span><span className="reservation-stat-icon">↓</span></div><h2>S/ {serviciosVisibles.length ? Math.min(...servicios.map(servicio => Number(servicio.precio))).toFixed(2) : '0.00'}</h2><small>Precio mínimo registrado</small></article>
            <article className="room-summary-card reservation-stat services-stat-results"><div className="reservation-stat-top"><span>Resultados encontrados</span><span className="reservation-stat-icon">⌕</span></div><h2>{serviciosFiltrados.length}</h2><small>Coincidencias de búsqueda</small></article>
          </div>

          <div className="room-list reservations-list rooms-modern-list services-list">
            <div className="room-list-header reservations-list-header">
              <div><h2>Listado de servicios</h2><p>Administra los servicios registrados en el hotel.</p></div>
              <div className="reservations-header-actions"><span className="reservations-total-pill">{serviciosFiltrados.length} resultados</span>{puedeCrearEnModulo('Servicios') && <button type="button" className="reservation-new-button" onClick={abrirRegistroServicio}>＋ Nuevo servicio</button>}</div>
            </div>
            <DynamicListFilterPanel title="Servicios" listKey="servicios" searchValue={busquedaServicio} searchPlaceholder="Buscar por nombre de servicio..." attributes={atributosFiltroServicios} activeFilters={obtenerFiltrosActivosLista('servicios')} onSearchChange={valor => actualizarFiltroLista('servicios', setBusquedaServicio, valor)} onAddFilter={agregarFiltroAvanzadoLista} onRemoveFilter={quitarFiltroAvanzadoLista} onClearFilters={lista => { setBusquedaServicio(''); limpiarFiltrosAvanzadosLista(lista) }} />
<div className="table-container reservations-table-container rooms-modern-table-container">
              <table className="rooms-table rooms-modern-table services-table">
                <thead><tr><SortableHeader field='id' list='servicios' label='ID' sort={ordenesLista['servicios']} onSort={campo => alternarOrdenLista('servicios', campo)} /><SortableHeader field='nombre' list='servicios' label='NOMBRE DEL SERVICIO' sort={ordenesLista['servicios']} onSort={campo => alternarOrdenLista('servicios', campo)} /><SortableHeader field='precio' list='servicios' label='PRECIO' sort={ordenesLista['servicios']} onSort={campo => alternarOrdenLista('servicios', campo)} /><th className="reservation-action-heading">ACCIONES</th></tr></thead>
                <tbody>
                  {serviciosPagina.rows.map(servicio => <tr key={servicio.id}>
                    <td>{servicio.id}</td><td><strong>{servicio.nombre}</strong></td><td>S/ {Number(servicio.precio).toFixed(2)}</td>
                    <td className="reservation-action-cell"><div className="reservation-row-actions">
                      <button type="button" className="reservation-detail-button" onClick={() => setServicioSeleccionado(servicio)}>Ver detalle</button>
                      <button type="button" className="reservation-edit-button" hidden={!puedeEditarEnModulo('Servicios')} onClick={() => abrirEdicionServicio(servicio)}>Editar</button>
                      <button type="button" className="reservation-cancel-record-button" hidden={!puedeEliminarEnModulo()} onClick={() => setServicioPorEliminar(servicio)}>Eliminar</button>
                    </div></td>
                  </tr>)}
                  {serviciosFiltrados.length === 0 && <tr><td colSpan="4" className="empty-message">No se encontraron servicios con ese criterio.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="reservations-list-footer"><span>Mostrando {serviciosFiltrados.length} de {serviciosVisibles.length} servicios</span><span>Tabla SERVICIO del modelo relacional</span></div>
              <ListPagination totalItems={serviciosFiltrados.length} {...serviciosPagina} onPageChange={pagina => cambiarPaginaLista('servicios', pagina)} onPageSizeChange={tamano => cambiarTamanoPaginaLista('servicios', tamano)} />
          </div>

          {mostrarModalServicio && (servicioEnEdicion ? puedeEditarEnModulo('Servicios') : puedeCrearEnModulo('Servicios')) && <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setMostrarModalServicio(false) }}>
            <section className="reservation-modal room-create-modal" role="dialog" aria-modal="true" aria-labelledby="service-form-title">
              <div className="reservation-modal-header"><div><span className="reservations-eyebrow">{servicioEnEdicion ? 'ACTUALIZAR REGISTRO' : 'NUEVO REGISTRO'}</span><h2 id="service-form-title">{servicioEnEdicion ? 'Editar servicio' : 'Registrar servicio'}</h2><p>Completa los atributos de la tabla SERVICIO.</p></div><button type="button" className="reservation-modal-close" onClick={() => setMostrarModalServicio(false)} aria-label="Cerrar ventana">×</button></div>
              <form onSubmit={guardarServicio}><div className="reservation-form-grid">
                <label className="reservation-form-field"><span>Nombre del servicio *</span><input type="text" maxLength="100" placeholder="Ej. Desayuno" value={formularioServicio.nombre} onChange={e => setFormularioServicio(actual => ({ ...actual, nombre: e.target.value }))} required /></label>
                <label className="reservation-form-field"><span>Precio (S/) *</span><input type="number" min="0" step="0.01" placeholder="Ej. 30.00" value={formularioServicio.precio} onChange={e => setFormularioServicio(actual => ({ ...actual, precio: e.target.value }))} required /></label>
                <label className="reservation-form-field"><span>Hotel relacionado (FK) *</span><select value={formularioServicio.hotel_id_hotel} onChange={e => setFormularioServicio(actual => ({ ...actual, hotel_id_hotel: e.target.value }))} required><option value="">Selecciona un hotel</option>{hoteles.map(hotel => <option key={hotel.id_hotel} value={hotel.id_hotel}>{hotel.nombre}</option>)}</select></label>
              </div>{errorServicio && <p className="reservation-form-error" role="alert">{errorServicio}</p>}<div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setMostrarModalServicio(false)}>Cancelar</button><button type="submit" className="reservation-save-button">{servicioEnEdicion ? 'Guardar cambios' : 'Registrar servicio'}</button></div></form>
            </section>
          </div>}

          {servicioSeleccionado && <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setServicioSeleccionado(null) }}>
            <section className="reservation-detail-modal room-detail-modal" role="dialog" aria-modal="true" aria-labelledby="service-detail-title">
              <div className="reservation-modal-header"><div><span className="reservations-eyebrow">INFORMACIÓN DEL REGISTRO</span><h2 id="service-detail-title">Detalle del servicio</h2><p>Información de la tabla SERVICIO y del hotel relacionado mediante su clave foránea.</p></div><button type="button" className="reservation-modal-close" onClick={() => setServicioSeleccionado(null)} aria-label="Cerrar detalle">×</button></div>
              <DetailPrimaryKey label="ID_SERVICIO (PK)" value={servicioSeleccionado.id} />
              {(() => {
                const hotelRelacionado = hoteles.find(hotel => Number(hotel.id_hotel) === Number(servicioSeleccionado.hotel_id_hotel))
                const mostrarDato = valor => valor === null || valor === undefined || String(valor).trim() === '' ? 'No registrado' : valor
                return <div className="reservation-detail-grid">
                  <article className="reservation-detail-group">
                    <h3>Datos del hotel</h3>
                    <div className="reservation-detail-item"><span>ID_HOTEL (FK)</span><strong>{hotelRelacionado?.id_hotel ?? servicioSeleccionado.hotel_id_hotel ?? 'No registrado'}</strong></div>
                    <div className="reservation-detail-item"><span>Nombre</span><strong>{mostrarDato(hotelRelacionado?.nombre)}</strong></div>
                    <div className="reservation-detail-item"><span>Dirección</span><strong>{mostrarDato(hotelRelacionado?.direccion)}</strong></div>
                    <div className="reservation-detail-item"><span>Ciudad</span><strong>{mostrarDato(hotelRelacionado?.ciudad)}</strong></div>
                    <div className="reservation-detail-item"><span>País</span><strong>{mostrarDato(hotelRelacionado?.pais)}</strong></div>
                    <div className="reservation-detail-item"><span>Teléfono</span><strong>{mostrarDato(hotelRelacionado?.telefono)}</strong></div>
                    <div className="reservation-detail-item"><span>Email</span><strong>{mostrarDato(hotelRelacionado?.email)}</strong></div>
                    <div className="reservation-detail-item"><span>Categoría</span><strong>{mostrarDato(hotelRelacionado?.categoria)}</strong></div>
                  </article>
                  <article className="reservation-detail-group">
                    <h3>Datos del servicio</h3>
                    <div className="reservation-detail-item"><span>Nombre</span><strong>{servicioSeleccionado.nombre}</strong></div>
                    <div className="reservation-detail-item"><span>Precio</span><strong>S/ {Number(servicioSeleccionado.precio).toFixed(2)}</strong></div>
                  </article>
                </div>
              })()}
              {(() => {
                const consumosRelacionados = obtenerConsumosServicio(servicioSeleccionado)
                return <DetailRelatedRecords title="Consumos asociados" rows={consumosRelacionados} emptyMessage="Este servicio todavía no tiene consumos registrados en CONSUMO_SERVICIO." columns={[
                  { key: 'id_consumo', label: 'ID_CONSUMO (PK)', render: consumo => consumo.id_consumo },
                  { key: 'cantidad', label: 'CANTIDAD', render: consumo => consumo.cantidad },
                  { key: 'subtotal', label: 'SUBTOTAL', render: consumo => `S/ ${Number(consumo.subtotal).toFixed(2)}` },
                ]} />
              })()}
              <div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setServicioSeleccionado(null)}>Cerrar</button>{puedeEditarEnModulo('Servicios') && <button type="button" className="reservation-save-button" onClick={() => { const servicio = servicioSeleccionado; setServicioSeleccionado(null); abrirEdicionServicio(servicio) }}>Editar servicio</button>}</div>
            </section>
          </div>}

          {servicioPorEliminar && (() => {
            const consumosRelacionados = obtenerConsumosServicio(servicioPorEliminar)
            return <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setServicioPorEliminar(null) }}>
              <section className="reservation-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="service-delete-title"><div className="reservation-confirm-icon">!</div><h2 id="service-delete-title">{consumosRelacionados.length ? 'No se puede eliminar este servicio' : '¿Eliminar este servicio?'}</h2>
                {consumosRelacionados.length ? <><p>El servicio <strong>{servicioPorEliminar.nombre}</strong> está relacionado con registros de consumo.</p><div className="reservation-confirm-notice"><strong>{consumosRelacionados.length}</strong> consumo(s) de la tabla CONSUMO_SERVICIO están asociados. Primero debe eliminarse o actualizarse esa relación para conservar la integridad referencial.</div><div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setServicioPorEliminar(null)}>Cerrar</button></div></> : <><p>Estás por eliminar el servicio <strong>{servicioPorEliminar.nombre}</strong>. Esta acción no se podrá deshacer.</p><div className="reservation-confirm-notice">Solo se permite eliminar servicios que no tengan consumos asociados.</div><div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setServicioPorEliminar(null)}>Conservar servicio</button><button type="button" className="reservation-confirm-danger-button" onClick={confirmarEliminarServicio}>Sí, eliminar</button></div></>}
              </section>
            </div>
          })()}
        </section>
      )
    }

    // ========================================
    // MODULO PAGOS
    // ========================================

    if (seccionActiva === 'Pagos') {
      const totalPagado = pagos.reduce((total, pago) => total + Number(pago.monto || 0), 0)
      const formatearMontoPago = monto => `S/ ${Number(monto || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      return (
        <section className="rooms-section reservations-section payments-section">
          <div className="reservations-heading"><div className="welcome"><span className="reservations-eyebrow">GESTIÓN HOTELERA</span><h1>Gestión de pagos</h1><p>Consulta y administra los pagos asociados a las estadías de Hotel Los Andes.</p></div><div className="reservations-heading-note"><span className="reservations-note-icon">▦</span><div><strong>{pagosVisibles.length} registros</strong><span>Pagos en el sistema</span></div></div></div>
          <div className="room-summary reservations-summary">
            <article className="room-summary-card reservation-stat reservation-stat-total"><div className="reservation-stat-top"><span>Total de pagos</span><span className="reservation-stat-icon">▤</span></div><h2>{pagosVisibles.length}</h2><small>Registros almacenados</small></article>
            <article className="room-summary-card reservation-stat reservation-stat-confirmed"><div className="reservation-stat-top"><span>Importe acumulado</span><span className="reservation-stat-icon">S/</span></div><h2>{formatearMontoPago(totalPagado)}</h2><small>Suma de pagos registrados</small></article>
            <article className="room-summary-card reservation-stat reservation-stat-completed"><div className="reservation-stat-top"><span>Pagos en efectivo</span><span className="reservation-stat-icon">$</span></div><h2>{pagosVisibles.filter(p => p.metodo_pago.toUpperCase() === 'EFECTIVO').length}</h2><small>Según método registrado</small></article>
            <article className="room-summary-card reservation-stat reservation-stat-cancelled"><div className="reservation-stat-top"><span>Resultados encontrados</span><span className="reservation-stat-icon">⌕</span></div><h2>{pagosFiltrados.length}</h2><small>Coincidencias de búsqueda</small></article>
          </div>
          <div className="room-list reservations-list"><div className="room-list-header reservations-list-header"><div><h2>Listado de pagos</h2><p>Registros de la tabla PAGO relacionados con ESTADIA.</p></div><div className="reservations-header-actions"><span className="reservations-total-pill">{pagosFiltrados.length} resultados</span><button type="button" className="reservation-new-button" hidden={!puedeCrearEnModulo('Pagos')} onClick={abrirRegistroPago} disabled={estadiasVisibles.length === 0} title={estadiasVisibles.length === 0 ? 'Primero registra una estadía para poder asociar un pago.' : 'Registrar pago'}>＋ Nuevo pago</button></div></div>
            <DynamicListFilterPanel title="Pagos" listKey="pagos" searchValue={busquedaPago} searchPlaceholder="Buscar por ID, estadía, fecha, método o monto..." attributes={atributosFiltroPagos} activeFilters={obtenerFiltrosActivosLista('pagos')} onSearchChange={valor => actualizarFiltroLista('pagos', setBusquedaPago, valor)} onAddFilter={agregarFiltroAvanzadoLista} onRemoveFilter={quitarFiltroAvanzadoLista} onClearFilters={lista => { setBusquedaPago(''); limpiarFiltrosAvanzadosLista(lista) }} />
<div className="table-container"><table className="rooms-table reservations-table"><thead><tr><SortableHeader field='id' list='pagos' label='ID_PAGO' sort={ordenesLista['pagos']} onSort={campo => alternarOrdenLista('pagos', campo)} /><SortableHeader field='fecha' list='pagos' label='FECHA_PAGO' sort={ordenesLista['pagos']} onSort={campo => alternarOrdenLista('pagos', campo)} /><SortableHeader field='monto' list='pagos' label='MONTO' sort={ordenesLista['pagos']} onSort={campo => alternarOrdenLista('pagos', campo)} /><SortableHeader field='metodo' list='pagos' label='METODO_PAGO' sort={ordenesLista['pagos']} onSort={campo => alternarOrdenLista('pagos', campo)} /><th>ACCIONES</th></tr></thead><tbody>
              {pagosPagina.rows.map(pago => <tr key={pago.id_pago}><td>{pago.id_pago}</td><td>{formatearFechaReserva(pago.fecha_pago)}</td><td>{formatearMontoPago(pago.monto)}</td><td>{pago.metodo_pago}</td><td className="reservation-action-cell"><div className="reservation-row-actions"><button type="button" className="reservation-detail-button" onClick={() => setPagoSeleccionado(pago)}>Ver detalle</button><button type="button" className="reservation-edit-button" hidden={!puedeEditarEnModulo('Pagos')} onClick={() => abrirEdicionPago(pago)}>Editar</button><button type="button" className="reservation-cancel-record-button" hidden={!puedeEliminarEnModulo()} onClick={() => setPagoPorEliminar(pago)}>Eliminar</button></div></td></tr>)}
              {pagosFiltrados.length === 0 && <tr><td colSpan="5" className="empty-message">{busquedaPago ? 'No se encontraron pagos con ese criterio.' : 'Todavía no hay pagos registrados en PAGO.'}</td></tr>}
            </tbody></table></div><div className="reservations-list-footer"><span>Mostrando {pagosFiltrados.length} de {pagosVisibles.length} pagos</span><span>Tabla PAGO del modelo relacional</span></div>
              <ListPagination totalItems={pagosFiltrados.length} {...pagosPagina} onPageChange={pagina => cambiarPaginaLista('pagos', pagina)} onPageSizeChange={tamano => cambiarTamanoPaginaLista('pagos', tamano)} />
            {estadiasVisibles.length === 0 && <p className="consumption-dependency-note">Para registrar un pago primero debe existir una estadía en ESTADIA. El formulario se habilitará cuando haya una estadía disponible, evitando claves foráneas inválidas.</p>}
          </div>
          {mostrarModalPago && <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setMostrarModalPago(false) }}><section className="reservation-modal room-create-modal" role="dialog" aria-modal="true" aria-labelledby="payment-form-title"><div className="reservation-modal-header"><div><span className="reservations-eyebrow">{pagoEnEdicion ? 'ACTUALIZAR REGISTRO' : 'NUEVO REGISTRO'}</span><h2 id="payment-form-title">{pagoEnEdicion ? `Editar pago ${pagoEnEdicion.id_pago}` : 'Registrar pago'}</h2><p>Completa los atributos de PAGO y selecciona la estadía relacionada.</p></div><button type="button" className="reservation-modal-close" onClick={() => setMostrarModalPago(false)} aria-label="Cerrar ventana">×</button></div><form onSubmit={guardarPago}><div className="reservation-form-grid"><label className="reservation-form-field"><span>Estadía relacionada (FK) *</span><select value={formularioPago.estadia_id_estadia} onChange={e => setFormularioPago(actual => ({ ...actual, estadia_id_estadia: e.target.value }))} required><option value="">Selecciona una estadía</option>{estadias.map(item => <option key={item.id_estadia} value={item.id_estadia}>Estadía #{item.id_estadia} · {formatearFechaReserva(item.fecha_check_in)} – {formatearFechaReserva(item.fecha_check_out)}</option>)}</select><small>La selección conserva la clave foránea de ESTADIA.</small></label><label className="reservation-form-field"><span>Fecha de pago *</span><input type="date" value={formularioPago.fecha_pago} onChange={e => setFormularioPago(actual => ({ ...actual, fecha_pago: e.target.value }))} required /></label><label className="reservation-form-field"><span>Monto (S/) *</span><input type="number" min="0.01" step="0.01" placeholder="Ej. 250.00" value={formularioPago.monto} onChange={e => setFormularioPago(actual => ({ ...actual, monto: e.target.value }))} required /></label><label className="reservation-form-field"><span>Método de pago *</span><input type="text" maxLength="50" placeholder="Ej. Efectivo, Tarjeta, Transferencia" value={formularioPago.metodo_pago} onChange={e => setFormularioPago(actual => ({ ...actual, metodo_pago: e.target.value }))} required /></label></div>{errorPago && <p className="reservation-form-error" role="alert">{errorPago}</p>}<div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setMostrarModalPago(false)}>Cancelar</button><button type="submit" className="reservation-save-button">{pagoEnEdicion ? 'Guardar cambios' : 'Registrar pago'}</button></div></form></section></div>}
          {pagoSeleccionado && (() => { const estadia = obtenerEstadiaPago(pagoSeleccionado); const reserva = obtenerReservaPago(pagoSeleccionado); return <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setPagoSeleccionado(null) }}><section className="reservation-detail-modal room-detail-modal" role="dialog" aria-modal="true" aria-labelledby="payment-detail-title"><div className="reservation-modal-header"><div><span className="reservations-eyebrow">INFORMACIÓN DEL REGISTRO</span><h2 id="payment-detail-title">Detalle del pago</h2><p>Información de PAGO y de la estadía relacionada mediante su clave foránea.</p></div><button type="button" className="reservation-modal-close" onClick={() => setPagoSeleccionado(null)} aria-label="Cerrar detalle">×</button></div><DetailPrimaryKey label="ID_PAGO (PK)" value={pagoSeleccionado.id_pago} /><div className="reservation-detail-grid"><article className="reservation-detail-group"><h3>Datos del pago</h3><div className="reservation-detail-item"><span>Fecha de pago</span><strong>{formatearFechaReserva(pagoSeleccionado.fecha_pago)}</strong></div><div className="reservation-detail-item"><span>Monto</span><strong>{formatearMontoPago(pagoSeleccionado.monto)}</strong></div><div className="reservation-detail-item"><span>Método de pago</span><strong>{pagoSeleccionado.metodo_pago}</strong></div></article><article className="reservation-detail-group"><h3>Estadía relacionada</h3><div className="reservation-detail-item"><span>ESTADIA_ID_ESTADIA (FK)</span><strong>{pagoSeleccionado.estadia_id_estadia}</strong></div><div className="reservation-detail-item"><span>Fecha de check-in</span><strong>{estadia ? formatearFechaReserva(estadia.fecha_check_in) : 'No registrada'}</strong></div><div className="reservation-detail-item"><span>Fecha de check-out</span><strong>{estadia ? formatearFechaReserva(estadia.fecha_check_out) : 'No registrada'}</strong></div><div className="reservation-detail-item"><span>Huésped (mediante reserva)</span><strong>{reserva ? nombreClienteReserva(reserva) : 'No registrado'}</strong></div><div className="reservation-detail-item"><span>Habitación (mediante reserva)</span><strong>{reserva ? `Hab. ${numeroHabitacionReserva(reserva)}` : 'No registrada'}</strong></div></article></div><div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setPagoSeleccionado(null)}>Cerrar</button><button type="button" className="reservation-save-button" hidden={!puedeEditarEnModulo('Pagos')} onClick={() => { const item = pagoSeleccionado; setPagoSeleccionado(null); abrirEdicionPago(item) }}>Editar pago</button></div></section></div> })()}
          {pagoPorEliminar && <div className="reservation-modal-backdrop"><section className="reservation-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="payment-delete-title"><div className="reservation-confirm-icon">!</div><h2 id="payment-delete-title">¿Eliminar este pago?</h2><p>Se eliminará el pago <strong>#{pagoPorEliminar.id_pago}</strong> por <strong>{formatearMontoPago(pagoPorEliminar.monto)}</strong>.</p><div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setPagoPorEliminar(null)}>Conservar pago</button><button type="button" className="reservation-confirm-danger-button" onClick={confirmarEliminarPago}>Sí, eliminar</button></div></section></div>}
        </section>
      )
    }

    // ========================================
    // MODULO MANTENIMIENTO
    // ========================================

    if (seccionActiva === 'Mantenimiento') {
      const costoTotalMantenimiento = mantenimientosVisibles.reduce((total, item) => total + Number(item.costo), 0)
      return (
        <section className="rooms-section reservations-section maintenance-section">
          <div className="reservations-heading">
            <div className="welcome">
              <span className="reservations-eyebrow">GESTIÓN HOTELERA</span>
              <h1>Gestión de mantenimiento</h1>
              <p>{employeeSession ? 'Consulta y administra los mantenimientos de ' + employeeSession.hotel.nombre + '.' : 'Consulta y administra los mantenimientos del hotel.'}</p>
            </div>
            <div className="reservations-heading-note">
              <span className="reservations-note-icon">▦</span>
              <div><strong>{mantenimientosVisibles.length} registros</strong><span>Mantenimientos en el sistema</span></div>
            </div>
          </div>

          <div className="room-summary rooms-modern-summary maintenance-modern-summary">
            <article className="room-summary-card reservation-stat reservation-stat-total"><div className="reservation-stat-top"><span>Total de mantenimientos</span><span className="reservation-stat-icon">⚒</span></div><h2>{mantenimientosVisibles.length}</h2><small>Registros en MANTENIMIENTO</small></article>
            <article className="room-summary-card reservation-stat maintenance-stat-cost"><div className="reservation-stat-top"><span>Costo total</span><span className="reservation-stat-icon">S/</span></div><h2>S/ {costoTotalMantenimiento.toFixed(2)}</h2><small>Costo registrado</small></article>
            <article className="room-summary-card reservation-stat maintenance-stat-average"><div className="reservation-stat-top"><span>Costo promedio</span><span className="reservation-stat-icon">↗</span></div><h2>S/ {(costoTotalMantenimiento / (mantenimientosVisibles.length || 1)).toFixed(2)}</h2><small>Promedio por registro</small></article>
            <article className="room-summary-card reservation-stat maintenance-stat-results"><div className="reservation-stat-top"><span>Resultados encontrados</span><span className="reservation-stat-icon">⌕</span></div><h2>{mantenimientosFiltrados.length}</h2><small>Coincidencias de búsqueda</small></article>
          </div>

          <div className="room-list reservations-list rooms-modern-list maintenance-list">
            <div className="room-list-header reservations-list-header">
              <div><h2>Listado de mantenimientos</h2><p>Administra los registros de la tabla MANTENIMIENTO.</p></div>
              <div className="reservations-header-actions"><span className="reservations-total-pill">{mantenimientosFiltrados.length} resultados</span>{puedeCrearEnModulo('Mantenimiento') && <button type="button" className="reservation-new-button" onClick={abrirRegistroMantenimiento} disabled={!habitacionesVisibles.length || !empleadosDelHotel.length} title={!habitacionesVisibles.length || !empleadosDelHotel.length ? 'Registra al menos una habitación y un empleado.' : 'Registrar mantenimiento'}>＋ Nuevo mantenimiento</button>}</div>
            </div>
            <DynamicListFilterPanel title="Mantenimiento" listKey="mantenimientos" searchValue={busquedaMantenimiento} searchPlaceholder="Buscar por ID, fecha, tipo, costo, habitación o empleado..." attributes={atributosFiltroMantenimiento} activeFilters={obtenerFiltrosActivosLista('mantenimientos')} onSearchChange={valor => actualizarFiltroLista('mantenimientos', setBusquedaMantenimiento, valor)} onAddFilter={agregarFiltroAvanzadoLista} onRemoveFilter={quitarFiltroAvanzadoLista} onClearFilters={lista => { setBusquedaMantenimiento(''); limpiarFiltrosAvanzadosLista(lista) }} />
<div className="table-container reservations-table-container rooms-modern-table-container">
              <table className="rooms-table rooms-modern-table maintenance-table">
                <thead><tr><SortableHeader field='id' list='mantenimientos' label='ID_MANTENIMIENTO' sort={ordenesLista['mantenimientos']} onSort={campo => alternarOrdenLista('mantenimientos', campo)} /><SortableHeader field='fecha' list='mantenimientos' label='FECHA_INICIO' sort={ordenesLista['mantenimientos']} onSort={campo => alternarOrdenLista('mantenimientos', campo)} /><SortableHeader field='tipo' list='mantenimientos' label='TIPO' sort={ordenesLista['mantenimientos']} onSort={campo => alternarOrdenLista('mantenimientos', campo)} /><SortableHeader field='costo' list='mantenimientos' label='COSTO' sort={ordenesLista['mantenimientos']} onSort={campo => alternarOrdenLista('mantenimientos', campo)} /><th className="reservation-action-heading">ACCIONES</th></tr></thead>
                <tbody>
                  {mantenimientosPagina.rows.map(mantenimiento => <tr key={mantenimiento.id_mantenimiento}>
                    <td>{mantenimiento.id_mantenimiento}</td><td>{formatearFechaReserva(mantenimiento.fecha_inicio)}</td><td><strong>{mantenimiento.tipo}</strong></td><td>S/ {Number(mantenimiento.costo).toFixed(2)}</td>
                    <td className="reservation-action-cell"><div className="reservation-row-actions"><button type="button" className="reservation-detail-button" onClick={() => setMantenimientoSeleccionado(mantenimiento)}>Ver detalle</button>{puedeEditarEnModulo('Mantenimiento') && <button type="button" className="reservation-edit-button" onClick={() => abrirEdicionMantenimiento(mantenimiento)}>Editar</button>}{puedeEliminarEnModulo() && <button type="button" className="reservation-cancel-record-button" onClick={() => setMantenimientoPorEliminar(mantenimiento)}>Eliminar</button>}</div></td>
                  </tr>)}
                  {mantenimientosFiltrados.length === 0 && <tr><td colSpan="5" className="empty-message">No se encontraron mantenimientos con ese criterio.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="reservations-list-footer"><span>Mostrando {mantenimientosFiltrados.length} de {mantenimientosVisibles.length} mantenimientos</span><span>Tabla MANTENIMIENTO del modelo relacional</span></div>
              <ListPagination totalItems={mantenimientosFiltrados.length} {...mantenimientosPagina} onPageChange={pagina => cambiarPaginaLista('mantenimientos', pagina)} onPageSizeChange={tamano => cambiarTamanoPaginaLista('mantenimientos', tamano)} />
          </div>

          {mostrarModalMantenimiento && (mantenimientoEnEdicion ? puedeEditarEnModulo('Mantenimiento') : puedeCrearEnModulo('Mantenimiento')) && <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setMostrarModalMantenimiento(false) }}>
            <section className="reservation-modal room-create-modal" role="dialog" aria-modal="true" aria-labelledby="maintenance-form-title">
              <div className="reservation-modal-header"><div><span className="reservations-eyebrow">{mantenimientoEnEdicion ? 'ACTUALIZAR REGISTRO' : 'NUEVO REGISTRO'}</span><h2 id="maintenance-form-title">{mantenimientoEnEdicion ? `Editar mantenimiento ${mantenimientoEnEdicion.id_mantenimiento}` : 'Registrar mantenimiento'}</h2><p>Completa los atributos y selecciona la habitación y el empleado relacionados.</p></div><button type="button" className="reservation-modal-close" onClick={() => setMostrarModalMantenimiento(false)} aria-label="Cerrar ventana">×</button></div>
              <form onSubmit={guardarMantenimiento}><div className="reservation-form-grid">
                <label className="reservation-form-field"><span>Fecha de inicio *</span><input type="date" value={formularioMantenimiento.fecha_inicio} onChange={e => setFormularioMantenimiento(actual => ({ ...actual, fecha_inicio: e.target.value }))} required /></label>
                <label className="reservation-form-field"><span>Tipo de mantenimiento *</span><input type="text" maxLength="20" placeholder="Ej. Revisión eléctrica" value={formularioMantenimiento.tipo} onChange={e => setFormularioMantenimiento(actual => ({ ...actual, tipo: e.target.value }))} required /><small>Máximo 20 caracteres.</small></label>
                <label className="reservation-form-field"><span>Costo (S/) *</span><input type="number" min="0" max="99999999.99" step="0.01" placeholder="Ej. 150.00" value={formularioMantenimiento.costo} onChange={e => setFormularioMantenimiento(actual => ({ ...actual, costo: e.target.value }))} required /></label>
                <label className="reservation-form-field"><span>Habitación relacionada (FK) *</span><select value={formularioMantenimiento.habitacion_id_habitacion} onChange={e => setFormularioMantenimiento(actual => ({ ...actual, habitacion_id_habitacion: e.target.value }))} required><option value="">Selecciona una habitación</option>{habitacionesVisibles.map(habitacion => <option key={habitacion.id} value={habitacion.id}>Hab. {habitacion.numero} · ID {habitacion.id}</option>)}</select><small>La habitación debe existir en el módulo Habitaciones.</small></label>
                <label className="reservation-form-field"><span>Empleado responsable (FK) *</span><select value={formularioMantenimiento.empleado_id_empleado} onChange={e => setFormularioMantenimiento(actual => ({ ...actual, empleado_id_empleado: e.target.value }))} required><option value="">Selecciona un empleado</option>{empleadosDelHotel.map(empleado => <option key={empleado.id} value={empleado.id}>{empleado.nombre} {empleado.apellido} · ID {empleado.id}</option>)}</select><small>El empleado debe existir en el módulo Empleados.</small></label>
              </div>{errorMantenimiento && <p className="reservation-form-error" role="alert">{errorMantenimiento}</p>}<div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setMostrarModalMantenimiento(false)}>Cancelar</button><button type="submit" className="reservation-save-button">{mantenimientoEnEdicion ? 'Guardar cambios' : 'Registrar mantenimiento'}</button></div></form>
            </section>
          </div>}

          {mantenimientoSeleccionado && (() => {
            const mantenimiento = mantenimientoSeleccionado
            const habitacion = obtenerHabitacionMantenimiento(mantenimiento)
            const empleado = obtenerEmpleadoMantenimiento(mantenimiento)
            const tipoHabitacion = habitacion ? tiposHabitacion.find(tipo => Number(tipo.id_tipo) === Number(habitacion.tipo_habitacion_id_tipo)) : null
            const hotelHabitacion = habitacion ? hoteles.find(hotel => Number(hotel.id_hotel) === Number(habitacion.hotel_id_hotel)) : null
            const cargoEmpleado = empleado ? obtenerCargoEmpleado(empleado) : null
            const hotelEmpleado = empleado ? obtenerHotelEmpleado(empleado) : null
            const mostrarDato = valor => valor !== null && valor !== undefined && valor !== '' ? valor : 'No registrado'
            return <div className="reservation-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setMantenimientoSeleccionado(null) }}>
              <section className="reservation-detail-modal room-detail-modal maintenance-detail-modal" role="dialog" aria-modal="true" aria-labelledby="maintenance-detail-title">
                <div className="reservation-modal-header"><div><span className="reservations-eyebrow">INFORMACIÓN DEL REGISTRO</span><h2 id="maintenance-detail-title">Detalle del mantenimiento</h2><p>Información del mantenimiento y de los registros relacionados.</p></div><button type="button" className="reservation-modal-close" onClick={() => setMantenimientoSeleccionado(null)} aria-label="Cerrar detalle">×</button></div>
                <DetailPrimaryKey label="ID_MANTENIMIENTO (PK)" value={mantenimiento.id_mantenimiento} />
                <div className="reservation-detail-grid">
                  <article className="reservation-detail-group"><h3>Datos del mantenimiento</h3><div className="reservation-detail-item"><span>Fecha de inicio</span><strong>{formatearFechaReserva(mantenimiento.fecha_inicio)}</strong></div><div className="reservation-detail-item"><span>Tipo</span><strong>{mantenimiento.tipo}</strong></div><div className="reservation-detail-item"><span>Costo</span><strong>S/ {Number(mantenimiento.costo).toFixed(2)}</strong></div></article>
                  <article className="reservation-detail-group"><h3>Habitación relacionada</h3><div className="reservation-detail-item"><span>HABITACION_ID_HABITACION (FK)</span><strong>{mantenimiento.habitacion_id_habitacion}</strong></div><div className="reservation-detail-item"><span>Número</span><strong>{mostrarDato(habitacion?.numero)}</strong></div><div className="reservation-detail-item"><span>Piso</span><strong>{mostrarDato(habitacion?.piso)}</strong></div><div className="reservation-detail-item"><span>Estado</span><strong>{mostrarDato(habitacion?.estado)}</strong></div><div className="reservation-detail-item"><span>Tipo de habitación</span><strong>{mostrarDato(tipoHabitacion?.nombre)}</strong></div><div className="reservation-detail-item"><span>Hotel</span><strong>{mostrarDato(hotelHabitacion?.nombre)}</strong></div></article>
                  <article className="reservation-detail-group"><h3>Empleado responsable</h3><div className="reservation-detail-item"><span>EMPLEADO_ID_EMPLEADO (FK)</span><strong>{mantenimiento.empleado_id_empleado}</strong></div><div className="reservation-detail-item"><span>Nombre</span><strong>{empleado ? `${empleado.nombre} ${empleado.apellido}` : 'Empleado no encontrado'}</strong></div><div className="reservation-detail-item"><span>Documento</span><strong>{mostrarDato(empleado?.documento)}</strong></div><div className="reservation-detail-item"><span>Fecha de ingreso</span><strong>{empleado?.fechaIngreso ? formatearFechaReserva(empleado.fechaIngreso) : 'No registrada'}</strong></div><div className="reservation-detail-item"><span>Cargo</span><strong>{mostrarDato(cargoEmpleado?.nombre)}</strong></div><div className="reservation-detail-item"><span>Hotel</span><strong>{mostrarDato(hotelEmpleado?.nombre)}</strong></div></article>
                </div>
                <div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setMantenimientoSeleccionado(null)}>Cerrar detalle</button>{puedeEditarEnModulo('Mantenimiento') && <button type="button" className="reservation-save-button" onClick={() => { const actual = mantenimientoSeleccionado; setMantenimientoSeleccionado(null); abrirEdicionMantenimiento(actual) }}>Editar mantenimiento</button>}</div>
              </section>
            </div>
          })()}

          {mantenimientoPorEliminar && <div className="reservation-modal-backdrop"><section className="reservation-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="maintenance-delete-title"><div className="reservation-confirm-icon">!</div><h2 id="maintenance-delete-title">¿Eliminar este mantenimiento?</h2><p>Se eliminará el mantenimiento <strong>#{mantenimientoPorEliminar.id_mantenimiento}</strong> ({mantenimientoPorEliminar.tipo}) asociado a la habitación <strong>{obtenerHabitacionMantenimiento(mantenimientoPorEliminar)?.numero ?? 'no encontrada'}</strong>.</p><div className="reservation-confirm-notice">Esta acción no se podrá deshacer.</div><div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setMantenimientoPorEliminar(null)}>Conservar registro</button><button type="button" className="reservation-confirm-danger-button" onClick={confirmarEliminarMantenimiento}>Sí, eliminar</button></div></section></div>}
        </section>
      )
    }


    // ========================================
    // MODULO HOTELES
    // ========================================

    if (seccionActiva === 'Hoteles') {
      const habitacionesAsociadas = habitacionesVisibles.filter(habitacion =>
        hoteles.some(hotel => Number(hotel.id_hotel) === Number(habitacion.hotel_id_hotel))
      ).length
      const empleadosAsociados = empleados.filter(empleado =>
        hoteles.some(hotel => Number(hotel.id_hotel) === Number(empleado.hotel_id_hotel))
      ).length
      const serviciosAsociados = serviciosVisibles.filter(servicio =>
        hoteles.some(hotel => Number(hotel.id_hotel) === Number(servicio.hotel_id_hotel))
      ).length

      return (
        <section className="rooms-section rooms-modern-section hotels-section">
          <div className="reservations-heading">
            <div className="welcome">
              <span className="reservations-eyebrow">GESTIÓN HOTELERA</span>
              <h1>Gestión de hoteles</h1>
              <p>Consulta la información de los hoteles y sus registros asociados.</p>
            </div>
            <div className="rooms-heading-actions">
              <div className="reservations-heading-note">
                <span className="reservations-note-icon">▦</span>
                <div><strong>{hoteles.length} registros</strong><span>Hoteles en el sistema</span></div>
              </div>
            </div>
          </div>

          <div className="room-summary rooms-modern-summary hotels-summary">
            <article className="room-summary-card reservation-stat reservation-stat-total">
              <div className="reservation-stat-top"><span>Total de hoteles registrados</span><span className="reservation-stat-icon">▤</span></div>
              <h2>{hoteles.length}</h2><small>Registros en HOTEL</small>
            </article>
            <article className="room-summary-card reservation-stat rooms-stat-available">
              <div className="reservation-stat-top"><span>Habitaciones asociadas</span><span className="reservation-stat-icon">⌂</span></div>
              <h2>{habitacionesAsociadas}</h2><small>Relacionadas mediante HOTEL_ID_HOTEL</small>
            </article>
            <article className="room-summary-card reservation-stat rooms-stat-occupied">
              <div className="reservation-stat-top"><span>Empleados asociados</span><span className="reservation-stat-icon">♙</span></div>
              <h2>{empleadosAsociados}</h2><small>Relacionados mediante HOTEL_ID_HOTEL</small>
            </article>
            <article className="room-summary-card reservation-stat rooms-stat-maintenance">
              <div className="reservation-stat-top"><span>Servicios asociados</span><span className="reservation-stat-icon">▦</span></div>
              <h2>{serviciosAsociados}</h2><small>Relacionados mediante HOTEL_ID_HOTEL</small>
            </article>
          </div>

          <div className="room-list reservations-list rooms-modern-list hotels-list">
            <div className="room-list-header reservations-list-header">
              <div><h2>Listado de hoteles</h2><p>Consulta los atributos registrados en la tabla HOTEL.</p></div>
              <div className="reservations-header-actions"><span className="reservations-total-pill">{hotelesFiltrados.length} resultados</span><button type="button" className="reservation-new-button" onClick={abrirRegistroHotel}>＋ Nuevo hotel</button></div>
            </div>
            <DynamicListFilterPanel
              title="Hoteles"
              listKey="hoteles"
              searchValue={busquedaHotel}
              searchPlaceholder="Buscar por nombre, dirección, ciudad, país, teléfono, email o categoría..."
              attributes={atributosFiltroHoteles}
              activeFilters={obtenerFiltrosActivosLista('hoteles')}
              onSearchChange={valor => actualizarFiltroLista('hoteles', setBusquedaHotel, valor)}
              onAddFilter={agregarFiltroAvanzadoLista}
              onRemoveFilter={quitarFiltroAvanzadoLista}
              onClearFilters={lista => { setBusquedaHotel(''); limpiarFiltrosAvanzadosLista(lista) }}
            />
            <div className="table-container reservations-table-container rooms-modern-table-container hotels-table-container">
              <table className="rooms-table rooms-modern-table hotels-table">
                <thead><tr>
                  <SortableHeader field="id_hotel" list="hoteles" label="ID_HOTEL (PK)" sort={ordenesLista.hoteles} onSort={campo => alternarOrdenLista('hoteles', campo)} />
                  <SortableHeader field="nombre" list="hoteles" label="NOMBRE" sort={ordenesLista.hoteles} onSort={campo => alternarOrdenLista('hoteles', campo)} />
                  <SortableHeader field="direccion" list="hoteles" label="DIRECCION" sort={ordenesLista.hoteles} onSort={campo => alternarOrdenLista('hoteles', campo)} />
                  <SortableHeader field="ciudad" list="hoteles" label="CIUDAD" sort={ordenesLista.hoteles} onSort={campo => alternarOrdenLista('hoteles', campo)} />
                  <SortableHeader field="pais" list="hoteles" label="PAIS" sort={ordenesLista.hoteles} onSort={campo => alternarOrdenLista('hoteles', campo)} />
                  <SortableHeader field="telefono" list="hoteles" label="TELEFONO" sort={ordenesLista.hoteles} onSort={campo => alternarOrdenLista('hoteles', campo)} />
                  <SortableHeader field="email" list="hoteles" label="EMAIL" sort={ordenesLista.hoteles} onSort={campo => alternarOrdenLista('hoteles', campo)} />
                  <SortableHeader field="categoria" list="hoteles" label="CATEGORIA" sort={ordenesLista.hoteles} onSort={campo => alternarOrdenLista('hoteles', campo)} />
                  <th className="reservation-action-heading">ACCIONES</th>
                </tr></thead>
                <tbody>
                  {hotelesPagina.rows.map(hotel => (
                    <tr key={hotel.id_hotel}>
                      <td>{hotel.id_hotel}</td><td><strong>{hotel.nombre}</strong></td><td>{hotel.direccion}</td>
                      <td>{hotel.ciudad}</td><td>{hotel.pais}</td><td>{hotel.telefono}</td><td>{hotel.email}</td><td>{hotel.categoria}</td>
                      <td className="reservation-action-cell"><div className="reservation-row-actions">
                        <button type="button" className="reservation-detail-button" onClick={() => setHotelSeleccionado(hotel)}>Ver detalle</button>
                        <button type="button" className="reservation-edit-button" onClick={() => abrirEdicionHotel(hotel)}>Editar</button>
                        <button type="button" className="reservation-cancel-record-button" onClick={() => setHotelPorEliminar(hotel)}>Eliminar</button>
                      </div></td>
                    </tr>
                  ))}
                  {hotelesFiltrados.length === 0 && <tr><td colSpan="9" className="empty-message">No se encontraron hoteles con esos criterios.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="reservations-list-footer"><span>Mostrando {hotelesFiltrados.length} de {hoteles.length} hoteles</span><span>Tabla HOTEL del modelo relacional</span></div>
            <ListPagination totalItems={hotelesFiltrados.length} {...hotelesPagina} onPageChange={pagina => cambiarPaginaLista('hoteles', pagina)} onPageSizeChange={tamano => cambiarTamanoPaginaLista('hoteles', tamano)} />
          </div>

          {mostrarModalHotel && (
            <div className="reservation-modal-backdrop" onMouseDown={evento => { if (evento.target === evento.currentTarget) setMostrarModalHotel(false) }}>
              <section className="reservation-modal room-create-modal" role="dialog" aria-modal="true" aria-labelledby="hotel-form-title">
                <div className="reservation-modal-header"><div><span className="reservations-eyebrow">{hotelEnEdicion ? 'ACTUALIZAR REGISTRO' : 'NUEVO REGISTRO'}</span><h2 id="hotel-form-title">{hotelEnEdicion ? `Editar hotel: ${hotelEnEdicion.nombre}` : 'Registrar hotel'}</h2><p>Completa los atributos propios de la tabla HOTEL.</p></div><button type="button" className="reservation-modal-close" onClick={() => setMostrarModalHotel(false)} aria-label="Cerrar ventana">×</button></div>
                <form onSubmit={guardarHotel}>
                  <div className="reservation-form-grid">
                    <label className="reservation-form-field"><span>Nombre *</span><input type="text" value={formularioHotel.nombre} onChange={evento => setFormularioHotel(actual => ({ ...actual, nombre: evento.target.value }))} required /></label>
                    <label className="reservation-form-field"><span>Dirección *</span><input type="text" value={formularioHotel.direccion} onChange={evento => setFormularioHotel(actual => ({ ...actual, direccion: evento.target.value }))} required /></label>
                    <label className="reservation-form-field"><span>Ciudad *</span><input type="text" value={formularioHotel.ciudad} onChange={evento => setFormularioHotel(actual => ({ ...actual, ciudad: evento.target.value }))} required /></label>
                    <label className="reservation-form-field"><span>País *</span><input type="text" value={formularioHotel.pais} onChange={evento => setFormularioHotel(actual => ({ ...actual, pais: evento.target.value }))} required /></label>
                    <label className="reservation-form-field"><span>Teléfono *</span><input type="tel" value={formularioHotel.telefono} onChange={evento => setFormularioHotel(actual => ({ ...actual, telefono: evento.target.value }))} required /></label>
                    <label className="reservation-form-field"><span>Email *</span><input type="email" value={formularioHotel.email} onChange={evento => setFormularioHotel(actual => ({ ...actual, email: evento.target.value }))} required /></label>
                    <label className="reservation-form-field"><span>Categoría *</span><input type="text" value={formularioHotel.categoria} onChange={evento => setFormularioHotel(actual => ({ ...actual, categoria: evento.target.value }))} required /></label>
                  </div>
                  {errorHotel && <p className="reservation-form-error" role="alert">{errorHotel}</p>}
                  <div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setMostrarModalHotel(false)}>Cancelar</button><button type="submit" className="reservation-save-button">{hotelEnEdicion ? 'Guardar cambios' : 'Registrar hotel'}</button></div>
                </form>
              </section>
            </div>
          )}

          {hotelSeleccionado && (() => {
            const dependencias = obtenerDependenciasHotel(hotelSeleccionado)
            return <div className="reservation-modal-backdrop" onMouseDown={evento => { if (evento.target === evento.currentTarget) setHotelSeleccionado(null) }}>
              <section className="reservation-detail-modal room-detail-modal" role="dialog" aria-modal="true" aria-labelledby="hotel-detail-title">
                <div className="reservation-modal-header"><div><span className="reservations-eyebrow">INFORMACIÓN DEL REGISTRO</span><h2 id="hotel-detail-title">Detalle del hotel {hotelSeleccionado.nombre}</h2><p>Información de la tabla HOTEL y de las entidades relacionadas mediante sus claves foráneas.</p></div><button type="button" className="reservation-modal-close" onClick={() => setHotelSeleccionado(null)} aria-label="Cerrar detalle">×</button></div>
                <DetailPrimaryKey label="ID_HOTEL (PK)" value={hotelSeleccionado.id_hotel} />
                <div className="reservation-detail-grid">
                  <article className="reservation-detail-group">
                    <h3>Datos del hotel</h3>
                    <div className="reservation-detail-item"><span>NOMBRE</span><strong>{hotelSeleccionado.nombre}</strong></div>
                    <div className="reservation-detail-item"><span>DIRECCION</span><strong>{hotelSeleccionado.direccion}</strong></div>
                    <div className="reservation-detail-item"><span>CIUDAD</span><strong>{hotelSeleccionado.ciudad}</strong></div>
                    <div className="reservation-detail-item"><span>PAIS</span><strong>{hotelSeleccionado.pais}</strong></div>
                    <div className="reservation-detail-item"><span>TELEFONO</span><strong>{hotelSeleccionado.telefono}</strong></div>
                    <div className="reservation-detail-item"><span>EMAIL</span><strong>{hotelSeleccionado.email}</strong></div>
                    <div className="reservation-detail-item"><span>CATEGORIA</span><strong>{hotelSeleccionado.categoria}</strong></div>
                  </article>
                </div>
                <DetailRelatedRecords title="Habitaciones relacionadas" rows={dependencias.habitaciones} emptyMessage="Este hotel todavía no tiene habitaciones relacionadas." columns={[
                  { key: 'id', label: 'ID_HABITACION (PK)', render: habitacion => habitacion.id },
                  { key: 'numero', label: 'NUMERO', render: habitacion => habitacion.numero },
                  { key: 'piso', label: 'PISO', render: habitacion => habitacion.piso },
                  { key: 'estado', label: 'ESTADO', render: habitacion => habitacion.estado },
                ]} />
                <DetailRelatedRecords title="Empleados relacionados" rows={dependencias.empleados} emptyMessage="Este hotel todavía no tiene empleados relacionados." columns={[
                  { key: 'id', label: 'ID_EMPLEADO (PK)', render: empleado => empleado.id },
                  { key: 'nombre', label: 'NOMBRE', render: empleado => empleado.nombre },
                  { key: 'apellido', label: 'APELLIDO', render: empleado => empleado.apellido },
                  { key: 'documento', label: 'DOCUMENTO', render: empleado => empleado.documento },
                  { key: 'fechaIngreso', label: 'FECHA_INGRESO', render: empleado => formatearFechaReserva(empleado.fechaIngreso) },
                ]} />
                <DetailRelatedRecords title="Servicios relacionados" rows={dependencias.servicios} emptyMessage="Este hotel todavía no tiene servicios relacionados." columns={[
                  { key: 'id', label: 'ID_SERVICIO (PK)', render: servicio => servicio.id },
                  { key: 'nombre', label: 'NOMBRE', render: servicio => servicio.nombre },
                  { key: 'precio', label: 'PRECIO', render: servicio => formatearMontoReserva(servicio.precio) },
                ]} />
                <div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setHotelSeleccionado(null)}>Cerrar detalle</button><button type="button" className="reservation-save-button" onClick={() => { const hotel = hotelSeleccionado; setHotelSeleccionado(null); abrirEdicionHotel(hotel) }}>Editar hotel</button></div>
              </section>
            </div>
          })()}

          {hotelPorEliminar && (() => {
            const dependencias = obtenerDependenciasHotel(hotelPorEliminar)
            const tieneDependencias = dependencias.habitacionesVisibles.length > 0 || dependencias.empleadosDelHotel.length > 0 || dependencias.serviciosVisibles.length > 0
            return <div className="reservation-modal-backdrop" onMouseDown={evento => { if (evento.target === evento.currentTarget) setHotelPorEliminar(null) }}>
              <section className="reservation-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="hotel-delete-title">
                <div className="reservation-confirm-icon">!</div>
                <h2 id="hotel-delete-title">{tieneDependencias ? 'No se puede eliminar este hotel' : '¿Eliminar este hotel?'}</h2>
                {tieneDependencias
                  ? <>
                    <p>No se puede eliminar <strong>{hotelPorEliminar.nombre}</strong> porque tiene registros relacionados.</p>
                    <div className="reservation-confirm-notice">
                      {dependencias.habitacionesVisibles.length > 0 && <div><strong>{dependencias.habitacionesVisibles.length}</strong> habitación(es) asociada(s).</div>}
                      {dependencias.empleadosDelHotel.length > 0 && <div><strong>{dependencias.empleadosDelHotel.length}</strong> empleado(s) asociado(s).</div>}
                      {dependencias.serviciosVisibles.length > 0 && <div><strong>{dependencias.serviciosVisibles.length}</strong> servicio(s) asociado(s).</div>}
                    </div>
                    <div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setHotelPorEliminar(null)}>Cerrar</button></div>
                  </>
                  : <>
                    <p>Estás por eliminar el hotel <strong>{hotelPorEliminar.nombre}</strong>. Esta acción no se podrá deshacer.</p>
                    <div className="reservation-confirm-notice">Solo se permite eliminar hoteles sin habitaciones, empleados ni servicios asociados.</div>
                    <div className="reservation-modal-footer"><button type="button" className="reservation-cancel-button" onClick={() => setHotelPorEliminar(null)}>Conservar hotel</button><button type="button" className="reservation-confirm-danger-button" onClick={confirmarEliminarHotel}>Sí, eliminar</button></div>
                  </>}
              </section>
            </div>
          })()}
        </section>
      )
    }

    // ========================================
    // MODULO DASHBOARD
    // ========================================

    if (seccionActiva === 'Dashboard') {
      const totalIngresos = pagos.reduce((total, pago) => total + pago.monto, 0)
      const disponibles = habitacionesVisibles.filter(h => h.estado === 'DISPONIBLE').length
      const ocupadas = habitacionesVisibles.filter(h => h.estado === 'OCUPADA').length
      const enMantenimiento = habitacionesVisibles.filter(h => h.estado === 'MANTENIMIENTO').length
      const porcentajeOcupacion = habitacionesVisibles.length
        ? Math.round((ocupadas / habitacionesVisibles.length) * 100)
        : 0
      const hoy = new Date()
      const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
      const reservasProximas = reservas
        .filter(r => r.estado === 'CONFIRMADA' && r.fecha_entrada >= fechaHoy)
        .sort((a, b) => a.fecha_entrada.localeCompare(b.fecha_entrada))
      const pagosRecientes = [...pagos].sort((a, b) => String(b.fecha_pago || '').localeCompare(String(a.fecha_pago || ''))).slice(0, 3)
      const formatearFecha = (fecha) => new Date(`${fecha}T00:00:00`).toLocaleDateString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric'
      })

      return (
        <section className="dashboard">
          <div className="dashboard-heading">
            <div className="welcome">
              <span className="eyebrow">PANEL DE CONTROL</span>
              <h1>¡Bienvenido de nuevo!</h1>
              <p>Este es el resumen general de Hotel Los Andes.</p>
            </div>
            <div className="dashboard-date">
              <span className="date-icon">▦</span>
              <div>
                <small>HOY</small>
                <strong>{hoy.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              </div>
            </div>
          </div>

          <div className="dashboard-section-title">
            <div>
              <h2>Resumen general</h2>
              <p>Indicadores principales del hotel</p>
            </div>
            <span className="live-label"><i /> Datos de demostración</span>
          </div>

          <div className="stats">
            <article className="stat-card stat-blue">
              <div className="stat-top"><span className="stat-icon">▣</span><span className="stat-caption">CAPACIDAD</span></div>
              <p>Total de habitaciones</p>
              <h2>{habitacionesVisibles.length}</h2>
              <span className="stat-foot">Habitaciones registradas</span>
            </article>
            <article className="stat-card stat-teal">
              <div className="stat-top"><span className="stat-icon">✓</span><span className="stat-caption">DISPONIBILIDAD</span></div>
              <p>Habitaciones disponibles</p>
              <h2>{disponibles}</h2>
              <span className="stat-foot">Listas para recibir huéspedes</span>
            </article>
            <article className="stat-card stat-purple">
              <div className="stat-top"><span className="stat-icon">▤</span><span className="stat-caption">RESERVAS</span></div>
              <p>Reservas confirmadas</p>
              <h2>{reservasProximas.length}</h2>
              <span className="stat-foot">Próximas llegadas pendientes</span>
            </article>
            <article className="stat-card stat-gold">
              <div className="stat-top"><span className="stat-icon">S/</span><span className="stat-caption">FINANZAS</span></div>
              <p>Ingresos registrados</p>
              <h2>S/ {totalIngresos.toLocaleString('es-PE')}</h2>
              <span className="stat-foot">Suma de pagos registrados</span>
            </article>
          </div>

          <div className="dashboard-grid">
            <article className="dashboard-panel occupancy-panel">
              <div className="panel-heading">
                <div><h2>Estado de habitaciones</h2><p>Distribución según su estado actual</p></div>
                <span className="panel-icon">▦</span>
              </div>
              <div className="occupancy-content">
                <div className="occupancy-chart" style={{ '--occupancy': `${porcentajeOcupacion}%` }}>
                  <div className="occupancy-center"><strong>{porcentajeOcupacion}%</strong><span>Ocupación</span></div>
                </div>
                <div className="occupancy-legend">
                  <div><span className="legend-dot available-dot"/><span>Disponibles</span><strong>{disponibles}</strong></div>
                  <div><span className="legend-dot occupied-dot"/><span>Ocupadas</span><strong>{ocupadas}</strong></div>
                  <div><span className="legend-dot maintenance-dot"/><span>Mantenimiento</span><strong>{enMantenimiento}</strong></div>
                </div>
              </div>
              <div className="occupancy-note">De {habitacionesVisibles.length} habitaciones registradas en total.</div>
            </article>

            <article className="dashboard-panel arrivals-panel">
              <div className="panel-heading">
                <div><h2>Próximas reservas</h2><p>Huéspedes que llegarán próximamente</p></div>
                <span className="panel-icon">▤</span>
              </div>
              {reservasProximas.length > 0 ? (
                <div className="upcoming-list">
                  {reservasProximas.slice(0, 4).map(reserva => (
                    <div className="upcoming-item" key={reserva.id_reserva}>
                      <div className="booking-date"><strong>{new Date(`${reserva.fecha_entrada}T00:00:00`).getDate()}</strong><span>{new Date(`${reserva.fecha_entrada}T00:00:00`).toLocaleDateString('es-PE', { month: 'short' })}</span></div>
                      <div className="booking-info"><strong>{nombreClienteReserva(reserva)}</strong><span>Habitación {numeroHabitacionReserva(reserva)} · {codigoReserva(reserva.id_reserva)}</span></div>
                      <span className="booking-status">Confirmada</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dashboard-empty"><span>✓</span><strong>No hay próximas reservas</strong><p>Las nuevas reservas confirmadas aparecerán aquí.</p></div>
              )}
            </article>

            <article className="dashboard-panel alerts-panel">
              <div className="panel-heading">
                <div><h2>Atención requerida</h2><p>Situaciones que necesitan seguimiento</p></div>
                <span className="panel-icon alert-icon">!</span>
              </div>
              {enMantenimiento > 0 ? (
                habitacionesVisibles.filter(h => h.estado === 'MANTENIMIENTO').map(h => (
                  <div className="alert-item" key={h.id}>
                    <span className="alert-symbol">!</span>
                    <div><strong>Habitación {h.numero}</strong><p>Se encuentra en mantenimiento · Piso {h.piso}</p></div>
                    <span className="alert-tag">Pendiente</span>
                  </div>
                ))
              ) : (
                <div className="dashboard-empty"><span>✓</span><strong>Todo en orden</strong><p>No hay habitaciones en mantenimiento.</p></div>
              )}
            </article>

            <article className="dashboard-panel payments-panel">
              <div className="panel-heading">
                <div><h2>Últimos pagos registrados</h2><p>Actividad financiera reciente</p></div>
                <span className="panel-icon">S/</span>
              </div>
              <div className="payment-list">
                {pagosRecientes.map(pago => (
                  <div className="payment-item" key={pago.id_pago}>
                    <span className="payment-symbol">S/</span>
                    <div className="payment-info"><strong>Pago #{pago.id_pago}</strong><span>{formatearFecha(pago.fecha_pago)} · {pago.metodo_pago}</span></div>
                    <strong className="payment-amount">S/ {pago.monto.toLocaleString('es-PE')}</strong>
                  </div>
                ))}
              </div>
              <div className="payments-total"><span>Total acumulado</span><strong>S/ {totalIngresos.toLocaleString('es-PE')}</strong></div>
            </article>
          </div>
        </section>
      )
    }

    // ========================================
    // MODULOS PENDIENTES
    // ========================================

    return (
      <section className="welcome">
        <h1>{seccionActiva}</h1>
        <p>Este módulo se desarrollará próximamente.</p>
      </section>
    )
  }

  // ==========================================
  // ESTRUCTURA PRINCIPAL
  // ==========================================

  return (
    <>
      <WelcomeScreen empleados={empleados} cargos={cargos} hoteles={hoteles} isAdminAuthenticated={adminAuthenticated} employeeSession={employeeSession} onAdminAuthenticated={() => setAdminAuthenticated(true)} onEmployeeContinue={session => { setEmployeeSession(session); setSeccionActiva(moduloInicialEmpleado(session.cargo?.nombre)) }} />
      <div className="app welcome-covered-app" aria-hidden={!adminAuthenticated && !employeeSession} inert={!adminAuthenticated && !employeeSession}>

      <aside className="sidebar">

        <h2 className="logo">
          Hotel<span>Manager</span>
        </h2>

        <p className="menu-title">MENÚ PRINCIPAL</p>

        <nav>
          {opcionesMenu.map((opcion) => (
            <button
              key={opcion}
              className={seccionActiva === opcion ? 'active' : ''}
              onClick={() => { if (puedeVerModulo(opcion)) setSeccionActiva(opcion) }}
            >
              {opcion}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          Sistema de gestión hotelera
        </div>

      </aside>

      <main className="main-content">

        <header className="topbar">

          <div>
            <h2>
              {seccionActiva === 'Dashboard'
                ? (employeeSession ? 'Entorno operativo' : 'Panel administrativo')
                : seccionActiva}
            </h2>

            <p>Bienvenido al sistema de gestión del hotel</p>
          </div>

          <div className="user">
            <div className="avatar">{employeeSession ? employeeSession.employee.nombre.charAt(0).toUpperCase() : 'A'}</div>
      <span>{employeeSession ? `${employeeSession.employee.nombre} ${employeeSession.employee.apellido} · ${employeeSession.hotel.nombre}` : 'Administrador'}</span>
          </div>

        </header>

        {mostrarContenido()}

      </main>

      </div>
    </>
  )
}

export default App

