-- Corrección manual de datos sintéticos. No es migración ni seed.
-- Exige los 20 registros originales: ante cualquier discrepancia revierte todo.
begin;
lock table public.cliente, public.empleado in share row exclusive mode;

do $correccion$
declare
  mapa constant jsonb := $datos$
[
  {
    "tipo": "cliente",
    "id": 1,
    "anterior_nombre": "Cliente",
    "anterior_apellido": "Sintético 01",
    "documento": "DEMO-CLI-001",
    "nombre": "Valeria",
    "apellido": "Quispe Salazar"
  },
  {
    "tipo": "cliente",
    "id": 2,
    "anterior_nombre": "Cliente",
    "anterior_apellido": "Sintético 02",
    "documento": "DEMO-CLI-002",
    "nombre": "Diego",
    "apellido": "Rojas Paredes"
  },
  {
    "tipo": "cliente",
    "id": 3,
    "anterior_nombre": "Cliente",
    "anterior_apellido": "Sintético 03",
    "documento": "DEMO-CLI-003",
    "nombre": "Camila",
    "apellido": "Torres Medina"
  },
  {
    "tipo": "cliente",
    "id": 4,
    "anterior_nombre": "Cliente",
    "anterior_apellido": "Sintético 04",
    "documento": "DEMO-CLI-004",
    "nombre": "Andrés",
    "apellido": "Vargas Cárdenas"
  },
  {
    "tipo": "cliente",
    "id": 5,
    "anterior_nombre": "Cliente",
    "anterior_apellido": "Sintético 05",
    "documento": "DEMO-CLI-005",
    "nombre": "Lucía",
    "apellido": "Paredes Flores"
  },
  {
    "tipo": "cliente",
    "id": 6,
    "anterior_nombre": "Cliente",
    "anterior_apellido": "Sintético 06",
    "documento": "DEMO-CLI-006",
    "nombre": "Joaquín",
    "apellido": "Mendoza Ríos"
  },
  {
    "tipo": "cliente",
    "id": 7,
    "anterior_nombre": "Cliente",
    "anterior_apellido": "Sintético 07",
    "documento": "DEMO-CLI-007",
    "nombre": "Mariana",
    "apellido": "Soto Carrillo"
  },
  {
    "tipo": "cliente",
    "id": 8,
    "anterior_nombre": "Cliente",
    "anterior_apellido": "Sintético 08",
    "documento": "DEMO-CLI-008",
    "nombre": "Emiliano",
    "apellido": "Luna Ortega"
  },
  {
    "tipo": "cliente",
    "id": 9,
    "anterior_nombre": "Cliente",
    "anterior_apellido": "Sintético 09",
    "documento": "DEMO-CLI-009",
    "nombre": "Renata",
    "apellido": "Vega Morales"
  },
  {
    "tipo": "cliente",
    "id": 10,
    "anterior_nombre": "Cliente",
    "anterior_apellido": "Sintético 10",
    "documento": "DEMO-CLI-010",
    "nombre": "Santiago",
    "apellido": "Herrera Cruz"
  },
  {
    "tipo": "cliente",
    "id": 11,
    "anterior_nombre": "Cliente",
    "anterior_apellido": "Sintético 11",
    "documento": "DEMO-CLI-011",
    "nombre": "Ximena",
    "apellido": "Castro Rivas"
  },
  {
    "tipo": "cliente",
    "id": 12,
    "anterior_nombre": "Cliente",
    "anterior_apellido": "Sintético 12",
    "documento": "DEMO-CLI-012",
    "nombre": "Mateo",
    "apellido": "Navarro Silva"
  },
  {
    "tipo": "empleado",
    "id": 1,
    "anterior_nombre": "Empleado",
    "anterior_apellido": "Sintético 01",
    "documento": "DEMO-EMP-001",
    "nombre": "Paola",
    "apellido": "Mendoza Cárdenas"
  },
  {
    "tipo": "empleado",
    "id": 2,
    "anterior_nombre": "Empleado",
    "anterior_apellido": "Sintético 02",
    "documento": "DEMO-EMP-002",
    "nombre": "Alonso",
    "apellido": "Rivas Quispe"
  },
  {
    "tipo": "empleado",
    "id": 3,
    "anterior_nombre": "Empleado",
    "anterior_apellido": "Sintético 03",
    "documento": "DEMO-EMP-003",
    "nombre": "Marisol",
    "apellido": "Flores Paredes"
  },
  {
    "tipo": "empleado",
    "id": 4,
    "anterior_nombre": "Empleado",
    "anterior_apellido": "Sintético 04",
    "documento": "DEMO-EMP-004",
    "nombre": "Héctor",
    "apellido": "Salazar Vega"
  },
  {
    "tipo": "empleado",
    "id": 5,
    "anterior_nombre": "Empleado",
    "anterior_apellido": "Sintético 05",
    "documento": "DEMO-EMP-005",
    "nombre": "Fernanda",
    "apellido": "Ortega Luna"
  },
  {
    "tipo": "empleado",
    "id": 6,
    "anterior_nombre": "Empleado",
    "anterior_apellido": "Sintético 06",
    "documento": "DEMO-EMP-006",
    "nombre": "Javier",
    "apellido": "Cruz Herrera"
  },
  {
    "tipo": "empleado",
    "id": 7,
    "anterior_nombre": "Empleado",
    "anterior_apellido": "Sintético 07",
    "documento": "DEMO-EMP-007",
    "nombre": "Daniela",
    "apellido": "Morales Soto"
  },
  {
    "tipo": "empleado",
    "id": 8,
    "anterior_nombre": "Empleado",
    "anterior_apellido": "Sintético 08",
    "documento": "DEMO-EMP-008",
    "nombre": "Rodrigo",
    "apellido": "Castro Navarro"
  }
]
$datos$::jsonb;
  coincidencias integer;
  actualizadas integer;
begin
  -- Los documentos DEMO refuerzan que se actúa sobre los registros previstos.
  select count(*) into coincidencias
  from jsonb_to_recordset(mapa) as m(tipo text, id bigint, anterior_nombre text,
       anterior_apellido text, documento text, nombre text, apellido text)
  left join public.cliente c on m.tipo = 'cliente' and c.id_cliente = m.id
  left join public.empleado e on m.tipo = 'empleado' and e.id_empleado = m.id
  where (m.tipo = 'cliente' and c.nombre = m.anterior_nombre
         and c.apellido = m.anterior_apellido and c.documento = m.documento)
     or (m.tipo = 'empleado' and e.nombre = m.anterior_nombre
         and e.apellido = m.anterior_apellido and e.documento = m.documento);
  if coincidencias <> 20 then
    raise exception 'Corrección cancelada: se esperaban 20 registros originales y coincidieron %', coincidencias;
  end if;

  update public.cliente c set nombre = m.nombre, apellido = m.apellido
  from jsonb_to_recordset(mapa) as m(tipo text, id bigint, nombre text, apellido text)
  where m.tipo = 'cliente' and c.id_cliente = m.id;
  get diagnostics actualizadas = row_count;
  if actualizadas <> 12 then raise exception 'No se actualizaron los 12 clientes'; end if;

  update public.empleado e set nombre = m.nombre, apellido = m.apellido
  from jsonb_to_recordset(mapa) as m(tipo text, id bigint, nombre text, apellido text)
  where m.tipo = 'empleado' and e.id_empleado = m.id;
  get diagnostics actualizadas = row_count;
  if actualizadas <> 8 then raise exception 'No se actualizaron los 8 empleados'; end if;
end
$correccion$;
commit;
