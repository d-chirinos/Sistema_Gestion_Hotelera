// ==========================================
// DATOS TEMPORALES DE HABITACIONES
// ==========================================

export const tiposHabitacionIniciales = [
  { id_tipo: 1, nombre: 'Simple', descripcion: 'Habitación individual', capacidad: 1, precio_base: 120 },
  { id_tipo: 2, nombre: 'Doble', descripcion: 'Habitación para dos personas', capacidad: 2, precio_base: 180 },
  { id_tipo: 3, nombre: 'Suite', descripcion: 'Habitación tipo suite', capacidad: 2, precio_base: 340 },
  { id_tipo: 4, nombre: 'Familiar', descripcion: 'Habitación amplia para familias', capacidad: 4, precio_base: 280 },
]

// Datos temporales del hotel relacionado con las habitaciones.
// Los campos no registrados se muestran como 'No registrado' en el detalle.
export const hotelesIniciales = [
  { id_hotel: 1, nombre: 'Hotel Los Andes', direccion: 'Av. Larco 1234', ciudad: 'Lima', pais: 'Perú', telefono: '014445566', email: 'contacto@hotelandes.example', categoria: '4 estrellas' },
]

export const habitacionesIniciales = [
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

export const reservasIniciales = [
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

export const clientesIniciales = [
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
export const cargosIniciales = [
  { id_cargo: 1, nombre: 'Recepcionista', salario_base: 2400 },
  { id_cargo: 2, nombre: 'Técnico de mantenimiento', salario_base: 2800 },
  { id_cargo: 3, nombre: 'Administrador', salario_base: 5200 },
  { id_cargo: 4, nombre: 'Electricista', salario_base: 3000 },
  { id_cargo: 5, nombre: 'Plomero', salario_base: 2850 },
  { id_cargo: 6, nombre: 'Técnico de climatización', salario_base: 3100 },
  { id_cargo: 7, nombre: 'Pintor', salario_base: 2600 },
]

export const empleadosIniciales = [
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

export const mantenimientosIniciales = [
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

export const consumosServiciosIniciales = [
  { id_consumo: 1, estadia_id_estadia: 1, servicio_id_servicio: 1, cantidad: 2, subtotal: 60 },
  { id_consumo: 2, estadia_id_estadia: 1, servicio_id_servicio: 2, cantidad: 1, subtotal: 20 },
  { id_consumo: 3, estadia_id_estadia: 3, servicio_id_servicio: 3, cantidad: 1, subtotal: 60 },
]

export const estadiasIniciales = [
  { id_estadia: 1, reserva_id_reserva: 1, empleado_id_empleado: 4, fecha_check_in: '2026-03-10', fecha_check_out: '2026-03-13' },
  { id_estadia: 2, reserva_id_reserva: 2, empleado_id_empleado: 5, fecha_check_in: '2026-06-05', fecha_check_out: '2026-06-08' },
  { id_estadia: 3, reserva_id_reserva: 5, empleado_id_empleado: 2, fecha_check_in: '2026-11-02', fecha_check_out: '2026-11-05' },
]

export const serviciosIniciales = [
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

export const pagosIniciales = [
  { id_pago: 1, estadia_id_estadia: 1, fecha_pago: '2026-03-11', monto: 240, metodo_pago: 'Tarjeta' },
  { id_pago: 2, estadia_id_estadia: 1, fecha_pago: '2026-03-12', monto: 120, metodo_pago: 'Efectivo' },
  { id_pago: 3, estadia_id_estadia: 3, fecha_pago: '2026-11-03', monto: 150, metodo_pago: 'Transferencia' },
]

