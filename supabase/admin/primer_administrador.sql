-- Plantilla para revisión y ejecución manual por un administrador autorizado
-- en el SQL Editor del proyecto correcto. NO es una migración ni un seed.
-- Sustituya únicamente los valores NULL necesarios en su copia del editor.
-- No guarde los datos reales en el repositorio.
--
-- Para vincular un empleado existente: indique v_auth_user_id y v_empleado_id.
-- Para crear un empleado nuevo: deje v_empleado_id en NULL y complete además
-- los seis campos de empleado. Hotel y cargo deben existir previamente.

begin;
-- Serializa altas concurrentes que respeten esta tabla, incluso con la tabla vacía.
lock table public.cuenta_empleado in share row exclusive mode;

do $bootstrap$
declare
  v_auth_user_id uuid := null;
  v_empleado_id bigint := null;
  v_hotel_id bigint := null;
  v_cargo_id bigint := null;
  v_nombre text := null;
  v_apellido text := null;
  v_documento text := null;
  v_fecha_ingreso date := null;
begin
  if v_auth_user_id is null then
    raise exception 'Indique el UUID verificado de Supabase Auth';
  end if;

  -- Evita eliminar la identidad mientras se crea el vínculo.
  perform 1 from auth.users where id = v_auth_user_id for key share;
  if not found then
    raise exception 'No existe el usuario Auth indicado';
  end if;

  -- No permite usar esta plantilla para añadir otro administrador ni reactivar uno.
  if exists (select 1 from public.cuenta_empleado where rol_sistema = 'ADMINISTRADOR') then
    raise exception 'Ya existe una cuenta ADMINISTRADOR; no se ejecutará el alta inicial';
  end if;
  if exists (select 1 from public.cuenta_empleado where auth_user_id = v_auth_user_id) then
    raise exception 'El usuario Auth ya tiene una vinculación';
  end if;

  if v_empleado_id is null then
    if v_hotel_id is null or v_cargo_id is null or v_nombre is null
       or btrim(v_nombre) = '' or v_apellido is null or btrim(v_apellido) = ''
       or v_documento is null or btrim(v_documento) = '' or v_fecha_ingreso is null then
      raise exception 'Faltan datos obligatorios del empleado nuevo';
    end if;
    insert into public.empleado (hotel_id_hotel, cargo_id_cargo, nombre, apellido, documento, fecha_ingreso)
      values (v_hotel_id, v_cargo_id, v_nombre, v_apellido, v_documento, v_fecha_ingreso)
      returning id_empleado into v_empleado_id;
  else
    -- Evita borrar o cambiar la clave del empleado durante la vinculación.
    perform 1 from public.empleado where id_empleado = v_empleado_id for key share;
    if not found then
      raise exception 'No existe el empleado indicado';
    end if;
    if exists (select 1 from public.cuenta_empleado where empleado_id_empleado = v_empleado_id) then
      raise exception 'El empleado ya tiene una vinculación';
    end if;
  end if;

  insert into public.cuenta_empleado (auth_user_id, empleado_id_empleado, rol_sistema, activo, fecha_vinculacion)
    values (v_auth_user_id, v_empleado_id, 'ADMINISTRADOR', true, now());
  raise notice 'Vinculación creada para empleado ID %; confirme el resultado de COMMIT', v_empleado_id;
end
$bootstrap$;

commit;
