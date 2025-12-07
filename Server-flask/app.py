from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from flask_cors import CORS, cross_origin
from flask_mail import Mail, Message
from models import db, User, Admin,Address,Product,Category,Favorite,Cart,CartItem,Order,OrderDetail
from sqlalchemy.exc import SQLAlchemyError
import mysql.connector
from mysql.connector import Error
from datetime import datetime
from datetime import datetime, timedelta  # Agrega timedelta
from cryptography.fernet import Fernet
import base64

# =====================================
# CONFIGURACIÓN INICIAL
# =====================================
app = Flask(__name__)
# =====================================
# CONFIGURACIÓN DE CORS
# =====================================
# 🚨 1. Define el origen permitido usando tu dominio de Amplify:
FRONTEND_ORIGIN = "https://master.dc988118koftz.amplifyapp.com" 

# 🚨 2. Aplica CORS, permitiendo solo ese origen:
# Nota: Ya importaste CORS en la línea superior 'from flask_cors import CORS, cross_origin'
CORS(app, resources={r"/*": {"origins": FRONTEND_ORIGIN}})
DIALOGFLOW_URL = "https://dialogflow.googleapis.com/v2/projects/PROJECT-ID/agent/sessions/123456:detectIntent"
app.config['SECRET_KEY'] = 'Fashion-Luxe'


from cryptography.fernet import Fernet
import base64
# =====================================
# FUNCIÓN MEJORADA PARA DESENCRIPTAR IDs
# =====================================

def decrypt_id(encrypted_id):
    """Desencripta un ID encriptado con Fernet"""
    try:
        # Convertir tu clave secreta a formato Fernet (32 bytes en base64)
        key = base64.urlsafe_b64encode(app.config['SECRET_KEY'].ljust(32)[:32].encode())
        cipher = Fernet(key)
        decrypted = cipher.decrypt(encrypted_id.encode()).decode()
        return decrypted
    except Exception as e:
        # Si falla con Fernet, probar otros formatos
        print(f"❌ Error desencriptando ID con Fernet: {str(e)}")
        
        # INTENTO 2: Si es un ID corto como "2C60F1FD", podría ser hexadecimal
        if len(encrypted_id) == 8 and all(c in '0123456789ABCDEF' for c in encrypted_id.upper()):
            try:
                # Convertir de hexadecimal a string
                decoded = bytes.fromhex(encrypted_id).decode('utf-8')
                print(f"🔓 Hexadecimal decodificado: {decoded}")
                return decoded
            except:
                pass
        
        # INTENTO 3: Si es base64
        try:
            import base64
            decoded = base64.b64decode(encrypted_id.encode()).decode()
            print(f"🔓 Base64 decodificado: {decoded}")
            return decoded
        except:
            pass
            
        # INTENTO 4: Si parece un hash corto, buscar directamente en la BD
        # (algunos sistemas muestran solo los primeros 8 caracteres del hash)
        if len(encrypted_id) == 8:
            print(f"🔍 Buscando órdenes que contengan: {encrypted_id}")
            orders = Order.query.filter(Order.id.like(f'%{encrypted_id}%')).all()
            if orders:
                print(f"✅ Encontradas {len(orders)} órdenes que contienen '{encrypted_id}'")
                if len(orders) == 1:
                    return orders[0].id
        
        return None
    except Exception as e:
        print(f"❌ Error en decrypt_id: {str(e)}")
        return None

# ========
# Base de datos MySQL
# ❌ COMENTAR O ELIMINAR ESTA FUNCIÓN. NO NECESITAS CREAR LA DB EN RDS.
# def create_database():
#     try:
#         connection = mysql.connector.connect(
#             host='localhost',
#             user='root',
#             password='root123'
#         )
#         # ... (resto de la función)
#     except Error as e:
#         print(f" Error creando base de datos: {e}")
#     finally:
#         # ...
# 
# create_database() # ❌ ELIMINAR ESTA LLAMADA TAMBIÉN.
# Configuración SQLAlchemy
# 🚨 REEMPLAZA ESTA LÍNEA por la configuración de tu RDS:
# app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+mysqlconnector://root:root123@localhost/tienda_online"

# ✅ LÍNEA NUEVA (Usando tu RDS y credenciales):
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+mysqlconnector://admin:admin123@integradoraclothingshop.c5iseo6a0s94.us-east-2.rds.amazonaws.com/integradoraclothingshop"

# Inicializaciones
bcrypt = Bcrypt(app)
CORS(app, supports_credentials=True)
db.init_app(app)

# Crear tablas
with app.app_context():
    db.create_all()

# =====================================
# CONFIGURACIÓN DEL CORREO
# =====================================
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = '20233tn020@gmail.com'
app.config['MAIL_PASSWORD'] = '64038HA6'
mail = Mail(app)

# =====================================
# RUTAS BÁSICAS
# =====================================
@app.route("/")
def hello_world():
    return "<p>Hello World</p>"

@app.route("/Signup", methods=["POST"])
def signup():
    data = request.json
    try:
        Nombre = data.get("Nombre")
        Apellido = data.get("Apellido")
        Email = data.get("Email")
        Password = data.get("Password")

        if not all([Nombre, Apellido, Email, Password]):
            return jsonify({"error": "Faltan campos obligatorios"}), 400

        # ======== DATOS OPCIONALES ========
        Telefono = data.get("Telefono")
        Fecha_nacimiento = data.get("Fecha_nacimiento")
        Genero = data.get("Genero")

        # ======== DATOS DE DIRECCIÓN ========
        Direccion = data.get("Direccion")
        Ciudad = data.get("Ciudad")
        Estado_provincia = data.get("Estado_provincia")
        Codigo_postal = data.get("Codigo_postal")
        Pais = data.get("Pais")
        Tipo_direccion = data.get("Tipo_direccion", "Casa")

        # ======== VALIDAR EMAIL EXISTENTE ========
        if User.query.filter_by(Email=Email).first():
            return jsonify({"error": "El correo ya está registrado"}), 409

        # ======== HASH PASSWORD ========
        hashed_password = bcrypt.generate_password_hash(Password).decode('utf-8')

        # ======== CREAR USUARIO ========
        new_user = User(
            Nombre=Nombre,
            Apellido=Apellido,
            Email=Email,
            Password=hashed_password,
            Telefono=Telefono,
            Genero=Genero
        )

        # Convertir fecha si viene
        if Fecha_nacimiento:
            from datetime import datetime
            new_user.Fecha_nacimiento = datetime.strptime(Fecha_nacimiento, "%Y-%m-%d").date()

        db.session.add(new_user)
        db.session.commit()  # Comitea primero para obtener el ID

        # ======== CREAR DIRECCIÓN (si se envió) ========
        if Direccion:  # <== Evita error si viene vacía
            nueva_direccion = Address(
                user_id=new_user.id,
                direccion=Direccion,
                ciudad=Ciudad,
                estado_provincia=Estado_provincia,
                codigo_postal=Codigo_postal,
                pais=Pais,
                tipo_direccion=Tipo_direccion,
                principal=True
            )
            db.session.add(nueva_direccion)
            db.session.commit()
        else:
            print(" No se proporcionó dirección, se omite Address.")

        # ======== SESIÓN OPCIONAL ========
        session["user_id"] = new_user.id

        # ======== RESPUESTA ========
        return jsonify({
            "id": new_user.id,
            "nombre": new_user.Nombre,
            "apellido": new_user.Apellido,
            "email": new_user.Email,
            "direccion": Direccion,
            "ciudad": Ciudad,
            "estado": Estado_provincia,
            "pais": Pais
        }), 201

    except Exception as e:
        db.session.rollback()
        print(" Error en registro:", e)
        return jsonify({"error": "Error interno del servidor", "detalle": str(e)}), 500



# =====================================
# REGISTRO DE ADMINISTRADOR
# =====================================
@app.route("/Signup_Admin", methods=["POST"])
def signup_admin():
    data = request.json

    Nombre = data.get("Nombre")
    Email = data.get("Email")
    Password = data.get("Password")
    Rol = data.get("Rol")

    if Admin.query.filter_by(Email=Email).first():
        return jsonify({"error": "Email already exists"}), 409

    hashed_password = bcrypt.generate_password_hash(Password)

    new_admin = Admin(
        Nombre=Nombre,
        Email=Email,
        Password=hashed_password,
        Rol=Rol
    )

    db.session.add(new_admin)
    db.session.commit()
    session["Admin_id"] = new_admin.id

    return jsonify({
        "id": new_admin.id,
        "Nombre": new_admin.Nombre,
        "Email": new_admin.Email,
        "Rol": new_admin.Rol
    }), 201

# =====================================
# LOGIN (USUARIO Y ADMIN)
# =====================================
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    Email = data.get("Email")
    Password = data.get("Password")

    if not Email or not Password:
        return jsonify({"error": "Por favor, completa todos los campos."}), 400

    # Buscar usuario o admin
    user = User.query.filter_by(Email=Email).first()
    user_type = "cliente" if user else None

    if not user:
        user = Admin.query.filter_by(Email=Email).first()
        if user:
            user_type = "admin"

    if not user:
        return jsonify({"error": "El correo no está registrado."}), 404

    if not bcrypt.check_password_hash(user.Password, Password):
        return jsonify({"error": "Contraseña incorrecta."}), 401

    session.clear()
    session["user_id" if user_type == "cliente" else "admin_id"] = user.id

    response = {
        "id": user.id,
        "Nombre": user.Nombre,
        "Email": user.Email,
        "Tipo": user_type,
        "Fecha_creacion": str(user.Fecha_creacion),
        "Activo": user.Activo if hasattr(user, 'Activo') else True
    }

    if user_type == "cliente":
        response.update({
            "Apellido": user.Apellido,
            "Telefono": user.Telefono,
            "Fecha_nacimiento": str(user.Fecha_nacimiento) if user.Fecha_nacimiento else None,
            "Genero": user.Genero,
        })
    else:
        response["Rol"] = user.Rol

    return jsonify({
        "message": f"Inicio de sesión exitoso como {user_type}.",
        "user": response
    }), 200


# =====================================
# MOSTRAR TODOS LOS CLIENTES CON SUS DIRECCIONES
# =====================================
@app.route("/users", methods=["GET"])
def get_all_users():
    try:
        users = User.query.all()

        if not users:
            return jsonify({"message": "No hay usuarios registrados"}), 404

        user_list = []
        for u in users:
            user_data = {
                "id": u.id,
                "Nombre": u.Nombre,
                "Apellido": u.Apellido,
                "Email": u.Email,
                "Foto": u.Foto_perfil,
                "Telefono": u.Telefono,
                "Fecha_Nacimiento": u.Fecha_nacimiento,
                "Genero": u.Genero,
                "Fecha_creacion": u.Fecha_creacion,
                "Fecha_actualizacion": u.Fecha_actualizacion,
                "Activo": u.Activo,
                "Direcciones": []  # Aquí guardaremos todas las direcciones del usuario
            }

            # Agregar direcciones (si existen)
            for d in u.Direcciones:
                user_data["Direcciones"].append({
                    "id": d.id,
                    "direccion": d.direccion,
                    "ciudad": d.ciudad,
                    "estado_provincia": d.estado_provincia,
                    "codigo_postal": d.codigo_postal,
                    "pais": d.pais,
                    "tipo_direccion": d.tipo_direccion,
                    "principal": d.principal
                })

            user_list.append(user_data)

        return jsonify({"users": user_list}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            "error": "Error al consultar la base de datos",
            "details": str(e)
        }), 500
    except Exception as e:
        return jsonify({
            "error": "Error interno del servidor",
            "details": str(e)
        }), 500

# =====================================
# ELIMINAR USUARIO 
# =====================================
@app.route("/DeleteUser", methods=["DELETE"])
def delete_user():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se enviaron datos"}), 400

        id = data.get("id")
        Nombre = data.get("Nombre")
        Email = data.get("Email")

        # Validar campos obligatorios
        if not id or not Email:
            return jsonify({
                "error": "Faltan campos obligatorios",
                "detalles": "Se requiere 'id' y 'Email'"
            }), 400

        # Buscar el usuario
        user = User.query.filter_by(id=id, Email=Email).first()
        if not user:
            return jsonify({
                "error": "Usuario no encontrado",
                "detalles": f"No existe usuario con ID={id} y Email='{Email}'"
            }), 404

        # Validar nombre (si se envió)
        if Nombre and user.Nombre != Nombre:
            return jsonify({
                "error": "Nombre no coincide",
                "detalles": f"El nombre '{Nombre}' no corresponde al usuario con Email '{Email}'"
            }), 400


        # Borrar todas las direcciones asociadas al usuario
        deleted_rows = Address.query.filter_by(user_id=id).delete()
        if deleted_rows > 0:
            print(f"Se eliminaron {deleted_rows} direcciones del usuario con ID {id}")

        # ELIMINAR EL USUARIO
        db.session.delete(user)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": f"Usuario '{user.Nombre}' y sus datos relacionados fueron eliminados correctamente",
            "user": {
                "id": user.id,
                "Nombre": user.Nombre,
                "Email": user.Email
            }
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            "error": "Error en la base de datos",
            "detalles": str(e.__dict__.get('orig', e))
        }), 500

    except Exception as e:
        return jsonify({
            "error": "Error interno del servidor",
            "detalles": str(e)
        }), 500


# ====================================
# UPDATE USUARIOS (CLIENTES)
# ====================================
@app.route("/UpdateUser", methods=["PUT"])
def update_user():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se enviaron datos"}), 400

        # Obtener campos enviados
        id = data.get("id")
        Nombre = data.get("Nombre")
        Apellido = data.get("Apellido")
        Email = data.get("Email")
        Password = data.get("Password")
        Telefono = data.get("Telefono")
        Genero = data.get("Genero")
        Activo = data.get("Activo")

        # Validación básica
        if not id:
            return jsonify({
                "error": "Faltan campos obligatorios",
                "detalles": "Se requiere 'id'"
            }), 400

        # Buscar usuario en la base de datos
        user = User.query.filter_by(id=id).first()
        if not user:
            return jsonify({
                "error": "Usuario no encontrado",
                "detalles": f"No existe usuario con ID={id}"
            }), 404

        # Actualizar solo los campos enviados
        if Nombre is not None:
            user.Nombre = Nombre
        if Apellido is not None:
            user.Apellido = Apellido
        if Email is not None:
            user.Email = Email

        # Encriptar contraseña si fue enviada
        if Password:
            hashed_password = bcrypt.generate_password_hash(Password).decode('utf-8')
            user.Password = hashed_password

        if Telefono is not None:
            user.Telefono = Telefono
        if Genero is not None:
            user.Genero = Genero
        if Activo is not None:
            user.Activo = Activo

        # Guardar cambios
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": f"Usuario '{user.Nombre}' actualizado correctamente",
            "user": {
                "id": user.id,
                "Nombre": user.Nombre,
                "Apellido": user.Apellido,
                "Email": user.Email,
                "Telefono": user.Telefono,
                "Genero": user.Genero,
                "Activo": user.Activo
            }
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            "error": "Error en la base de datos",
            "detalles": str(e.__dict__.get('orig', e))
        }), 500

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Error interno del servidor",
            "detalles": str(e)
        }), 500


    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            "error": "Error en la base de datos",
            "detalles": str(e.__dict__.get('orig', e))
        }), 500

    except Exception as e:
        return jsonify({
            "error": "Error interno del servidor",
            "detalles": str(e)
        }), 500


# ====================================
# CONTAR USUARIOS REGISTRADOS
# ====================================
@app.route("/UserCount", methods=["GET"])
def user_count():
    try:
        total_users = User.query.count()

        return jsonify({
            "status": "success",
            "total_usuarios": total_users
        }), 200

    except SQLAlchemyError as e:
        return jsonify({
            "error": "Error en la base de datos",
            "detalles": str(e.__dict__.get('orig', e))
        }), 500

    except Exception as e:
        return jsonify({
            "error": "Error interno del servidor",
            "detalles": str(e)
        }), 500
# =====================================
# Update password Administrador
# =====================================
@app.route("/UpdatePasswordAdmin", methods=["PUT"])
def update_password_admin():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se enviaron datos"}), 400
        
        Admin_id = data.get("id")
        current_password = data.get("Password")
        new_password = data.get("NewPassword")

        # Validación de campos requeridos
        if not Admin_id or not current_password or not new_password:
            return jsonify({
                "error": "Faltan campos obligatorios",
                "detalles": "Se requiere 'id', 'Password' y 'NewPassword'"
            }), 400

        # Buscar administrador por ID
        admin = Admin.query.filter_by(id=Admin_id).first()
        if not admin:
            return jsonify({
                "error": "Administrador no encontrado",
                "detalles": f"No existe usuario con ID={Admin_id}"
            }), 404

        # Verificar contraseña actual
        if not bcrypt.check_password_hash(admin.Password, current_password):
            return jsonify({"error": "Contraseña actual incorrecta"}), 401

        # Evitar que la nueva contraseña sea igual a la anterior
        if bcrypt.check_password_hash(admin.Password, new_password):
            return jsonify({"error": "La nueva contraseña no puede ser igual a la actual"}), 400

        # Actualizar contraseña con hashing seguro
        hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        admin.Password = hashed_password

        # Guardar cambios
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": f"Contraseña del administrador '{admin.Nombre}' actualizada correctamente"
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            "error": "Error en la base de datos",
            "detalles": str(e.__dict__.get('orig', e))
        }), 500
    except Exception as e:
        return jsonify({
            "error": "Error interno del servidor",
            "detalles": str(e)
        }), 500

# =====================================
# LOGOUT
# =====================================
@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Sesión cerrada correctamente"}), 200





# =====================================
# OBTENER DIRECCIONES DE UN USUARIO
# =====================================
@app.route("/user/<string:user_id>/addresses", methods=["GET"])
def get_user_addresses(user_id):
    try:
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        addresses = Address.query.filter_by(user_id=user.id).all()
        if not addresses:
            return jsonify({"message": "El usuario no tiene direcciones registradas"}), 200

        address_list = [{
            "id": addr.id,
            "direccion": addr.direccion,
            "ciudad": addr.ciudad,
            "estado_provincia": addr.estado_provincia,
            "codigo_postal": addr.codigo_postal,
            "pais": addr.pais,
            "tipo_direccion": addr.tipo_direccion,
            "principal":addr.principal
        } for addr in addresses]

        return jsonify({
            "usuario": {
                "id": user.id,
                "Nombre": user.Nombre,
                "Email": user.Email
            },
            "direcciones": address_list
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            "error": "Error en la base de datos",
            "detalles": str(e.__dict__.get("orig", e))
        }), 500

    except Exception as e:
        return jsonify({
            "error": "Error interno del servidor",
            "detalles": str(e)
        }), 500


# =====================================
# AGREGAR NUEVA DIRECCIÓN
# =====================================
@app.route("/address", methods=["POST"])
def add_address():
    data = request.get_json()
    try:
        new_addr = Address(
            user_id=data["user_id"],
            direccion=data["direccion"],
            ciudad=data["ciudad"],
            estado_provincia=data["estado_provincia"],
            codigo_postal=data["codigo_postal"],
            pais=data["pais"],
            tipo_direccion=data["tipo_direccion"],
            principal=data.get("principal", False),
        )
        db.session.add(new_addr)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Dirección agregada correctamente",
            "address": {
                "id": new_addr.id,
                "direccion": new_addr.direccion,
                "ciudad": new_addr.ciudad,
                "estado_provincia": new_addr.estado_provincia,
                "codigo_postal": new_addr.codigo_postal,
                "pais": new_addr.pais,
                "tipo_direccion": new_addr.tipo_direccion,
                "principal": new_addr.principal
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500




# =====================================
# ELIMINAR DIRECCIÓN
# =====================================
@app.route("/address/<string:address_id>", methods=["DELETE"])
def delete_address(address_id):
    try:
        addr = Address.query.get(address_id)
        if not addr:
            return jsonify({"error": "Dirección no encontrada"}), 404

        db.session.delete(addr)
        db.session.commit()
        return jsonify({"status": "success", "message": "Dirección eliminada"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# =====================================
# ACTUALIZAR LAS CONTRASEÑAS DE LOS USUARIOS (CLIENTES)
# =====================================
# =====================================

@app.route("/UpdatePasswordUser", methods=['PUT'])
def UpdatePasswordUser():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se enviaron datos"}), 400

        user_id = data.get("id")
        current_password = data.get("password")
        new_password = data.get("newPassword")

        if not user_id or not current_password or not new_password:
            return jsonify({
                "error": "Faltan campos obligatorios",
                "detalles": "Se requiere 'id', 'password' y 'newPassword'"
            }), 400

        # Buscar usuario por ID
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({
                "error": "Usuario no encontrado",
                "detalles": f"No existe usuario con ID={user_id}"
            }), 404

        # Verificar contraseña actual
        if not bcrypt.check_password_hash(user.Password, current_password):
            return jsonify({"error": "Contraseña actual incorrecta"}), 401

        # Evitar que la nueva contraseña sea igual a la anterior
        if bcrypt.check_password_hash(user.Password, new_password):
            return jsonify({"error": "La nueva contraseña no puede ser igual a la actual"}), 400

        # Actualizar contraseña
        hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        user.Password = hashed_password
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": f"Contraseña de '{user.Nombre}' actualizada correctamente"
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            "error": "Error en la base de datos",
            "detalles": str(e.__dict__.get('orig', e))
        }), 500
    except Exception as e:
        return jsonify({
            "error": "Error interno del servidor",
            "detalles": str(e)
        }), 500

# =====================================
# OBTENER TODOS LOS PRODUCTOS
# =====================================
@app.route("/products", methods=["GET"])
def get_all_products():
    try:
        products = Product.query.all()
        products_list = []
        
        for product in products:
            products_list.append({
                "id": product.id,
                "nombre": product.nombre,
                "descripcion": product.descripcion,
                "precio": float(product.precio),
                "stock": product.stock,
                "imagen_url": product.imagen_url,
                "genero": product.genero,
                "categoria_id": product.categoria_id,
                "categoria_nombre": product.categoria.nombre if product.categoria else None,
                "activo": product.activo,
                "creado_en": product.creado_en.isoformat() if product.creado_en else None,
                "actualizado_en": product.actualizado_en.isoformat() if product.actualizado_en else None
            })
        
        return jsonify({
            "status": "success",
            "data": products_list,
            "total": len(products_list)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# =====================================
# OBTENER TODAS LAS CATEGORÍAS
# =====================================
@app.route("/categories", methods=["GET"])
def get_all_categories():
    try:
        categories = Category.query.all()
        categories_list = []
        
        for category in categories:
            categories_list.append({
                "id": category.id,
                "nombre": category.nombre,
                "descripcion": category.descripcion,
                "total_productos": len(category.productos) if category.productos else 0
            })
        
        return jsonify({
            "status": "success",
            "data": categories_list,
            "total": len(categories_list)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# =====================================
# AGREGAR PRODUCTO A FAVORITOS
# =====================================
@app.route("/favorites/add", methods=["POST"])
def add_to_favorites():
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if not data or 'user_id' not in data or 'product_id' not in data:
            return jsonify({
                "status": "error",
                "message": "Se requieren user_id y product_id"
            }), 400
        
        user_id = data['user_id']
        product_id = data['product_id']
        
        # Verificar si el usuario existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                "status": "error",
                "message": "Usuario no encontrado"
            }), 404
        
        # Verificar si el producto existe y está activo
        product = Product.query.get(product_id)
        if not product:
            return jsonify({
                "status": "error",
                "message": "Producto no encontrado"
            }), 404
        
        if not product.activo:
            return jsonify({
                "status": "error",
                "message": "El producto no está disponible"
            }), 400
        
        # Verificar si ya está en favoritos
        existing_favorite = Favorite.query.filter_by(
            user_id=user_id, 
            product_id=product_id
        ).first()
        
        if existing_favorite:
            return jsonify({
                "status": "error",
                "message": "El producto ya está en tus favoritos"
            }), 400
        
        # Crear nuevo favorito
        new_favorite = Favorite(
            user_id=user_id,
            product_id=product_id,
            agregado_en=datetime.utcnow()
        )
        
        db.session.add(new_favorite)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "Producto agregado a favoritos",
            "data": {
                "favorite_id": new_favorite.id,
                "user_id": user_id,
                "product_id": product_id,
                "agregado_en": new_favorite.agregado_en.isoformat(),
                "producto": {
                    "nombre": product.nombre,
                    "precio": float(product.precio),
                    "imagen_url": product.imagen_url
                }
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": f"Error al agregar a favoritos: {str(e)}"
        }), 500
# =====================================
# ELIMINAR PRODUCTO DE FAVORITOS
# =====================================
@app.route("/favorites/remove", methods=["DELETE"])
def remove_from_favorites():
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if not data or 'user_id' not in data or 'product_id' not in data:
            return jsonify({
                "status": "error",
                "message": "Se requieren user_id y product_id"
            }), 400
        
        user_id = data['user_id']
        product_id = data['product_id']
        
        # Buscar el favorito
        favorite = Favorite.query.filter_by(
            user_id=user_id, 
            product_id=product_id
        ).first()
        
        if not favorite:
            return jsonify({
                "status": "error",
                "message": "El producto no está en tus favoritos"
            }), 404
        
        # Eliminar el favorito
        db.session.delete(favorite)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "Producto eliminado de favoritos",
            "data": {
                "user_id": user_id,
                "product_id": product_id
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": f"Error al eliminar de favoritos: {str(e)}"
        }), 500
# =====================================
# OBTENER TODOS LOS FAVORITOS DE UN USUARIO 
# =====================================
@app.route("/favorites/<user_id>", methods=["GET"])
def get_user_favorites(user_id):
    try:
        # Verificar si el usuario existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                "status": "error",
                "message": "Usuario no encontrado"
            }), 404

        # Obtener todos los favoritos del usuario con información completa del producto
        favorites = Favorite.query.filter_by(user_id=user_id).all()
        
        favorites_list = []
        for favorite in favorites:
            product = Product.query.get(favorite.product_id)
            if product:  # Solo si el producto existe
                product_data = {
                    "id": product.id,
                    "nombre": product.nombre,
                    "descripcion": product.descripcion,
                    "precio": float(product.precio),
                    "stock": product.stock,
                    "imagen_url": product.imagen_url,
                    "genero": product.genero,
                    "categoria_id": product.categoria_id,
                    "activo": product.activo
                }
                
                # Agregar categoría nombre si existe
                if product.categoria:
                    product_data["categoria_nombre"] = product.categoria.nombre
                
                # Agregar fechas si existen
                if product.creado_en:
                    product_data["creado_en"] = product.creado_en.isoformat()
                
                favorites_list.append({
                    "favorite_id": favorite.id,
                    "agregado_en": favorite.agregado_en.isoformat() if favorite.agregado_en else None,
                    "producto": product_data
                })
        
        return jsonify({
            "status": "success",
            "data": favorites_list,
            "total": len(favorites_list),
            "user_info": {
                "user_id": user.id,
                "nombre": f"{user.Nombre} {user.Apellido}",
                "email": user.Email
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error al obtener favoritos: {str(e)}"
        }), 500
# =====================================
# VERIFICAR SI UN PRODUCTO ESTÁ EN FAVORITOS 
# =====================================
@app.route("/favorites/check", methods=["POST"])
def check_favorite():
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if not data or 'user_id' not in data or 'product_id' not in data:
            return jsonify({
                "status": "error",
                "message": "Se requieren user_id y product_id"
            }), 400
        
        user_id = data['user_id']
        product_id = data['product_id']
        
        # Verificar si el usuario existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                "status": "error",
                "message": "Usuario no encontrado"
            }), 404
        
        # Verificar si el producto existe
        product = Product.query.get(product_id)
        if not product:
            return jsonify({
                "status": "error",
                "message": "Producto no encontrado"
            }), 404
        
        # Verificar si existe en favoritos
        favorite = Favorite.query.filter_by(
            user_id=user_id, 
            product_id=product_id
        ).first()
        
        is_favorite = favorite is not None
        
        response_data = {
            "is_favorite": is_favorite
        }
        
        # Solo agregar estos campos si existe el favorito
        if favorite:
            response_data.update({
                "favorite_id": favorite.id,
                "agregado_en": favorite.agregado_en.isoformat() if favorite.agregado_en else None
            })
        
        return jsonify({
            "status": "success",
            "data": response_data
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error al verificar favorito: {str(e)}"
        }), 500

# =====================================
# CONTAR FAVORITOS DE UN USUARIO
# =====================================
@app.route("/favorites/<user_id>/count", methods=["GET"])
def count_user_favorites(user_id):
    try:
        # Verificar si el usuario existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                "status": "error",
                "message": "Usuario no encontrado"
            }), 404
        
        # Contar favoritos del usuario
        favorites_count = Favorite.query.filter_by(user_id=user_id).count()
        
        return jsonify({
            "status": "success",
            "data": {
                "user_id": user_id,
                "total_favorites": favorites_count,
                "user_info": {
                    "nombre": f"{user.Nombre} {user.Apellido}",
                    "email": user.Email
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error al contar favoritos: {str(e)}"
        }), 500





# =====================================
# AGREGAR PRODUCTO AL CARRITO
# =====================================
@app.route("/cart/add", methods=["POST"])
def add_to_cart():
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if not data or 'user_id' not in data or 'product_id' not in data:
            return jsonify({
                "status": "error",
                "message": "Se requieren user_id y product_id"
            }), 400
        
        user_id = data['user_id']
        product_id = data['product_id']
        cantidad = data.get('cantidad', 1)  # Default 1 si no se especifica
        
        # Verificar si el usuario existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                "status": "error",
                "message": "Usuario no encontrado"
            }), 404
        
        # Verificar si el producto existe y está activo
        product = Product.query.get(product_id)
        if not product:
            return jsonify({
                "status": "error",
                "message": "Producto no encontrado"
            }), 404
        
        if not product.activo:
            return jsonify({
                "status": "error",
                "message": "El producto no está disponible"
            }), 400
        
        # Verificar stock disponible
        if product.stock < cantidad:
            return jsonify({
                "status": "error",
                "message": f"Stock insuficiente. Solo quedan {product.stock} unidades"
            }), 400
        
        # Buscar o crear carrito para el usuario
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            cart = Cart(user_id=user_id)
            db.session.add(cart)
            db.session.commit()
        
        # Verificar si el producto ya está en el carrito
        cart_item = CartItem.query.filter_by(
            cart_id=cart.id, 
            product_id=product_id
        ).first()
        
        if cart_item:
            # Actualizar cantidad si ya existe
            nueva_cantidad = cart_item.cantidad + cantidad
            
            # Verificar stock nuevamente
            if product.stock < nueva_cantidad:
                return jsonify({
                    "status": "error",
                    "message": f"Stock insuficiente. Máximo disponible: {product.stock} unidades"
                }), 400
            
            cart_item.cantidad = nueva_cantidad
            cart_item.subtotal = nueva_cantidad * product.precio
        else:
            # Crear nuevo item en el carrito
            subtotal = cantidad * product.precio
            cart_item = CartItem(
                cart_id=cart.id,
                product_id=product_id,
                cantidad=cantidad,
                subtotal=subtotal
            )
            db.session.add(cart_item)
        
        # Actualizar timestamp del carrito
        cart.actualizado_en = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "Producto agregado al carrito",
            "data": {
                "cart_id": cart.id,
                "item_id": cart_item.id,
                "product_id": product_id,
                "cantidad": cart_item.cantidad,
                "precio_unitario": float(product.precio),
                "subtotal": float(cart_item.subtotal),
                "producto": {
                    "nombre": product.nombre,
                    "imagen_url": product.imagen_url
                }
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": f"Error al agregar al carrito: {str(e)}"
        }), 500

# =====================================
# OBTENER CARRITO DE USUARIO
# =====================================
@app.route("/cart/<user_id>", methods=["GET"])
def get_cart(user_id):
    try:
        # Verificar si el usuario existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                "status": "error",
                "message": "Usuario no encontrado"
            }), 404

        # Buscar carrito del usuario
        cart = Cart.query.filter_by(user_id=user_id).first()
        
        if not cart:
            return jsonify({
                "status": "success",
                "data": {
                    "cart_id": None,
                    "items": [],
                    "total_items": 0,
                    "total_precio": 0.0,
                    "usuario": {
                        "user_id": user_id,
                        "nombre": f"{user.Nombre} {user.Apellido}"
                    }
                }
            }), 200
        
        # Obtener items del carrito con información completa
        cart_items = []
        total_precio = 0.0
        total_items = 0
        
        for item in cart.items:
            product = Product.query.get(item.product_id)
            if product and product.activo:  # Solo productos activos
                item_data = {
                    "item_id": item.id,
                    "product_id": product.id,
                    "nombre": product.nombre,
                    "descripcion": product.descripcion,
                    "precio_unitario": float(product.precio),
                    "cantidad": item.cantidad,
                    "subtotal": float(item.subtotal),
                    "imagen_url": product.imagen_url,
                    "stock_disponible": product.stock,
                    "categoria": product.categoria.nombre if product.categoria else None
                }
                cart_items.append(item_data)
                total_precio += item.subtotal
                total_items += item.cantidad
        
        return jsonify({
            "status": "success",
            "data": {
                "cart_id": cart.id,
                "items": cart_items,
                "total_items": total_items,
                "total_precio": float(total_precio),
                "usuario": {
                    "user_id": user_id,
                    "nombre": f"{user.Nombre} {user.Apellido}",
                    "email": user.Email
                },
                "fechas": {
                    "creado_en": cart.creado_en.isoformat() if cart.creado_en else None,
                    "actualizado_en": cart.actualizado_en.isoformat() if cart.actualizado_en else None
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error al obtener carrito: {str(e)}"
        }), 500

# =====================================
# ACTUALIZAR CANTIDAD EN CARRITO
# =====================================
@app.route("/cart/update", methods=["PUT"])
def update_cart_item():
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if not data or 'item_id' not in data or 'cantidad' not in data:
            return jsonify({
                "status": "error",
                "message": "Se requieren item_id y cantidad"
            }), 400
        
        item_id = data['item_id']
        nueva_cantidad = data['cantidad']
        
        # Validar cantidad
        if nueva_cantidad < 0:
            return jsonify({
                "status": "error",
                "message": "La cantidad no puede ser negativa"
            }), 400
        
        if nueva_cantidad == 0:
            # Si cantidad es 0, eliminar el item
            return remove_from_cart()
        
        # Buscar el item del carrito
        cart_item = CartItem.query.get(item_id)
        if not cart_item:
            return jsonify({
                "status": "error",
                "message": "Item del carrito no encontrado"
            }), 404
        
        # Verificar producto y stock
        product = Product.query.get(cart_item.product_id)
        if not product:
            return jsonify({
                "status": "error",
                "message": "Producto no encontrado"
            }), 404
        
        if not product.activo:
            return jsonify({
                "status": "error",
                "message": "El producto ya no está disponible"
            }), 400
        
        if product.stock < nueva_cantidad:
            return jsonify({
                "status": "error",
                "message": f"Stock insuficiente. Solo quedan {product.stock} unidades"
            }), 400
        
        # Actualizar cantidad y subtotal
        cart_item.cantidad = nueva_cantidad
        cart_item.subtotal = nueva_cantidad * product.precio
        
        # Actualizar timestamp del carrito
        cart = Cart.query.get(cart_item.cart_id)
        if cart:
            cart.actualizado_en = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "Carrito actualizado",
            "data": {
                "item_id": cart_item.id,
                "product_id": cart_item.product_id,
                "cantidad": cart_item.cantidad,
                "precio_unitario": float(product.precio),
                "subtotal": float(cart_item.subtotal),
                "producto": {
                    "nombre": product.nombre,
                    "stock_disponible": product.stock
                }
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": f"Error al actualizar carrito: {str(e)}"
        }), 500

# =====================================
# ELIMINAR PRODUCTO DEL CARRITO
# =====================================
@app.route("/cart/remove", methods=["DELETE"])
def remove_from_cart():
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if not data or 'item_id' not in data:
            return jsonify({
                "status": "error",
                "message": "Se requiere item_id"
            }), 400
        
        item_id = data['item_id']
        
        # Buscar el item del carrito
        cart_item = CartItem.query.get(item_id)
        if not cart_item:
            return jsonify({
                "status": "error",
                "message": "Item del carrito no encontrado"
            }), 404
        
        # Guardar info para la respuesta
        product_info = {
            "product_id": cart_item.product_id,
            "item_id": cart_item.id
        }
        
        # Eliminar el item
        db.session.delete(cart_item)
        
        # Actualizar timestamp del carrito
        cart = Cart.query.get(cart_item.cart_id)
        if cart:
            cart.actualizado_en = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "Producto eliminado del carrito",
            "data": product_info
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": f"Error al eliminar del carrito: {str(e)}"
        }), 500

# =====================================
# VACIAR CARRITO COMPLETO
# =====================================
@app.route("/cart/<user_id>/clear", methods=["DELETE"])
def clear_cart(user_id):
    try:
        # Verificar si el usuario existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                "status": "error",
                "message": "Usuario no encontrado"
            }), 404
        
        # Buscar carrito del usuario
        cart = Cart.query.filter_by(user_id=user_id).first()
        
        if not cart or not cart.items:
            return jsonify({
                "status": "success",
                "message": "El carrito ya está vacío",
                "data": {
                    "user_id": user_id,
                    "items_eliminados": 0
                }
            }), 200
        
        # Contar items a eliminar
        items_count = len(cart.items)
        
        # Eliminar todos los items
        for item in cart.items:
            db.session.delete(item)
        
        # Actualizar timestamp del carrito
        cart.actualizado_en = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": f"Carrito vaciado correctamente",
            "data": {
                "user_id": user_id,
                "items_eliminados": items_count,
                "cart_id": cart.id
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": f"Error al vaciar carrito: {str(e)}"
        }), 500

# =====================================
# CONTAR ITEMS EN CARRITO
# =====================================
@app.route("/cart/<user_id>/count", methods=["GET"])
def count_cart_items(user_id):
    try:
        # Verificar si el usuario existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                "status": "error",
                "message": "Usuario no encontrado"
            }), 404
        
        # Buscar carrito del usuario
        cart = Cart.query.filter_by(user_id=user_id).first()
        
        total_items = 0
        total_precio = 0.0
        
        if cart and cart.items:
            for item in cart.items:
                total_items += item.cantidad
                total_precio += item.subtotal
        
        return jsonify({
            "status": "success",
            "data": {
                "user_id": user_id,
                "total_items": total_items,
                "total_precio": float(total_precio),
                "usuario": {
                    "nombre": f"{user.Nombre} {user.Apellido}",
                    "email": user.Email
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error al contar items del carrito: {str(e)}"
        }), 500

# =====================================
# VERIFICAR STOCK DE ITEMS EN CARRITO
# =====================================
@app.route("/cart/<user_id>/check-stock", methods=["GET"])
def check_cart_stock(user_id):
    try:
        # Verificar si el usuario existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                "status": "error",
                "message": "Usuario no encontrado"
            }), 404
        
        # Buscar carrito del usuario
        cart = Cart.query.filter_by(user_id=user_id).first()
        
        if not cart or not cart.items:
            return jsonify({
                "status": "success",
                "message": "El carrito está vacío",
                "data": {
                    "user_id": user_id,
                    "stock_ok": True,
                    "items_sin_stock": []
                }
            }), 200
        
        # Verificar stock de cada item
        items_sin_stock = []
        
        for item in cart.items:
            product = Product.query.get(item.product_id)
            if product:
                stock_info = {
                    "item_id": item.id,
                    "product_id": product.id,
                    "nombre": product.nombre,
                    "cantidad_en_carrito": item.cantidad,
                    "stock_disponible": product.stock,
                    "suficiente": product.stock >= item.cantidad
                }
                
                if not stock_info["suficiente"]:
                    items_sin_stock.append(stock_info)
        
        return jsonify({
            "status": "success",
            "data": {
                "user_id": user_id,
                "stock_ok": len(items_sin_stock) == 0,
                "total_items_revisados": len(cart.items),
                "items_sin_stock": items_sin_stock,
                "resumen": {
                    "con_stock": len(cart.items) - len(items_sin_stock),
                    "sin_stock": len(items_sin_stock)
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error al verificar stock: {str(e)}"
        }), 500



# =====================================
# CREAR NUEVA ORDEN
# =====================================
@app.route("/orders", methods=["POST"])
def create_order():
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if not data or 'user_id' not in data or 'total' not in data:
            return jsonify({
                "status": "error",
                "message": "Se requieren user_id y total"
            }), 400
        
        user_id = data['user_id']
        total = data['total']
        metodo_pago = data.get('metodo_pago', 'credit_card')
        estado = data.get('estado', 'Pendiente')
        detalles = data.get('detalles', [])
        
        # Verificar si el usuario existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                "status": "error",
                "message": "Usuario no encontrado"
            }), 404
        
        # Verificar que hay detalles de orden
        if not detalles:
            return jsonify({
                "status": "error",
                "message": "La orden debe contener productos"
            }), 400
        
        # Crear nueva orden
        nueva_orden = Order(
            user_id=user_id,
            total=total,
            estado=estado,
            metodo_pago=metodo_pago
        )
        
        db.session.add(nueva_orden)
        db.session.flush()  # Para obtener el ID sin hacer commit
        
        # Crear detalles de la orden
        for detalle in detalles:
            # Verificar que el producto existe
            producto = Product.query.get(detalle['product_id'])
            if not producto:
                return jsonify({
                    "status": "error",
                    "message": f"Producto con ID {detalle['product_id']} no encontrado"
                }), 404
            
            # Verificar stock
            if producto.stock < detalle['cantidad']:
                return jsonify({
                    "status": "error",
                    "message": f"Stock insuficiente para {producto.nombre}. Stock disponible: {producto.stock}"
                }), 400
            
            # Crear detalle de orden
            nuevo_detalle = OrderDetail(
                order_id=nueva_orden.id,
                product_id=detalle['product_id'],
                cantidad=detalle['cantidad'],
                precio_unitario=detalle['precio_unitario'],
                subtotal=detalle['subtotal']
            )
            
            db.session.add(nuevo_detalle)
            
            # Actualizar stock del producto
            producto.stock -= detalle['cantidad']
            producto.actualizado_en = datetime.utcnow()
        
        # Confirmar todos los cambios
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "Orden creada exitosamente",
            "data": {
                "order_id": nueva_orden.id,
                "user_id": user_id,
                "total": total,
                "estado": estado,
                "metodo_pago": metodo_pago,
                "creado_en": nueva_orden.creado_en.isoformat(),
                "detalles_count": len(detalles)
            }
        }), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Error en la base de datos",
            "details": str(e)
        }), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Error interno del servidor",
            "details": str(e)
        }), 500

# =====================================
# OBTENER ÓRDENES DE UN USUARIO
# =====================================
@app.route("/orders/user/<string:user_id>", methods=["GET"])
def get_user_orders(user_id):
    try:
        # Verificar si el usuario existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                "status": "error",
                "message": "Usuario no encontrado"
            }), 404
        
        # Obtener órdenes del usuario
        orders = Order.query.filter_by(user_id=user_id).order_by(Order.creado_en.desc()).all()
        
        orders_list = []
        for order in orders:
            order_data = {
                "id": order.id,
                "total": float(order.total),
                "estado": order.estado,
                "metodo_pago": order.metodo_pago,
                "creado_en": order.creado_en.isoformat() if order.creado_en else None,
                "detalles": []
            }
            
            # Agregar detalles de la orden
            for detalle in order.detalles:
                producto = Product.query.get(detalle.product_id)
                order_data["detalles"].append({
                    "id": detalle.id,
                    "product_id": detalle.product_id,
                    "producto_nombre": producto.nombre if producto else "Producto no disponible",
                    "producto_imagen": producto.imagen_url if producto else None,
                    "cantidad": detalle.cantidad,
                    "precio_unitario": float(detalle.precio_unitario),
                    "subtotal": float(detalle.subtotal)
                })
            
            orders_list.append(order_data)
        
        return jsonify({
            "status": "success",
            "data": {
                "user": {
                    "id": user.id,
                    "nombre": f"{user.Nombre} {user.Apellido}",
                    "email": user.Email
                },
                "orders": orders_list,
                "total_orders": len(orders_list)
            }
        }), 200
        
    except SQLAlchemyError as e:
        return jsonify({
            "status": "error",
            "message": "Error en la base de datos",
            "details": str(e)
        }), 500
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Error interno del servidor",
            "details": str(e)
        }), 500

# =====================================
# OBTENER DETALLES DE UNA ORDEN ESPECÍFICA
# =====================================
@app.route("/orders/<string:order_id>", methods=["GET"])
def get_order_details(order_id):
    try:
        # Obtener la orden
        order = Order.query.get(order_id)
        if not order:
            return jsonify({
                "status": "error",
                "message": "Orden no encontrada"
            }), 404
        
        # Obtener información del usuario
        user = User.query.get(order.user_id)
        
        order_data = {
            "id": order.id,
            "user_info": {
                "id": user.id,
                "nombre": f"{user.Nombre} {user.Apellido}",
                "email": user.Email,
                "telefono": user.Telefono
            },
            "total": float(order.total),
            "estado": order.estado,
            "metodo_pago": order.metodo_pago,
            "creado_en": order.creado_en.isoformat() if order.creado_en else None,
            "detalles": []
        }
        
        # Agregar detalles de la orden
        for detalle in order.detalles:
            producto = Product.query.get(detalle.product_id)
            order_data["detalles"].append({
                "id": detalle.id,
                "product_id": detalle.product_id,
                "producto_nombre": producto.nombre if producto else "Producto no disponible",
                "producto_descripcion": producto.descripcion if producto else None,
                "producto_imagen": producto.imagen_url if producto else None,
                "cantidad": detalle.cantidad,
                "precio_unitario": float(detalle.precio_unitario),
                "subtotal": float(detalle.subtotal)
            })
        
        return jsonify({
            "status": "success",
            "data": order_data
        }), 200
        
    except SQLAlchemyError as e:
        return jsonify({
            "status": "error",
            "message": "Error en la base de datos",
            "details": str(e)
        }), 500
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Error interno del servidor",
            "details": str(e)
        }), 500

# =====================================
# ACTUALIZAR ESTADO DE UNA ORDEN
# =====================================
@app.route("/orders/<string:order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    try:
        data = request.get_json()
        
        if not data or 'estado' not in data:
            return jsonify({
                "status": "error",
                "message": "Se requiere el campo 'estado'"
            }), 400
        
        nuevo_estado = data['estado']
        
        # Estados válidos
        estados_validos = ['Pendiente', 'Confirmado', 'En preparación', 'Enviado', 'Entregado', 'Cancelado']
        
        if nuevo_estado not in estados_validos:
            return jsonify({
                "status": "error",
                "message": f"Estado no válido. Estados permitidos: {', '.join(estados_validos)}"
            }), 400
        
        # Obtener y actualizar la orden
        order = Order.query.get(order_id)
        if not order:
            return jsonify({
                "status": "error",
                "message": "Orden no encontrada"
            }), 404
        
        order.estado = nuevo_estado
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": f"Estado de la orden actualizado a: {nuevo_estado}",
            "data": {
                "order_id": order.id,
                "nuevo_estado": nuevo_estado
            }
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Error en la base de datos",
            "details": str(e)
        }), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Error interno del servidor",
            "details": str(e)
        }), 500

# =====================================
# CANCELAR ORDEN
# =====================================
@app.route("/orders/<string:order_id>/cancel", methods=["PUT"])
def cancel_order(order_id):
    try:
        # Obtener la orden
        order = Order.query.get(order_id)
        if not order:
            return jsonify({
                "status": "error",
                "message": "Orden no encontrada"
            }), 404
        
        # Verificar si la orden puede ser cancelada
        if order.estado in ['Entregado', 'Cancelado']:
            return jsonify({
                "status": "error",
                "message": f"No se puede cancelar una orden en estado: {order.estado}"
            }), 400
        
        # Devolver productos al stock
        for detalle in order.detalles:
            producto = Product.query.get(detalle.product_id)
            if producto:
                producto.stock += detalle.cantidad
                producto.actualizado_en = datetime.utcnow()
        
        # Actualizar estado de la orden
        order.estado = 'Cancelado'
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "Orden cancelada exitosamente",
            "data": {
                "order_id": order.id,
                "estado": "Cancelado"
            }
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Error en la base de datos",
            "details": str(e)
        }), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Error interno del servidor",
            "details": str(e)
        }), 500

# =====================================
# OBTENER TODAS LAS ÓRDENES (PARA ADMIN)
# =====================================
@app.route("/orders", methods=["GET"])
def get_all_orders():
    try:
        # Parámetros de paginación
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        estado = request.args.get('estado', None)
        
        # Consulta base
        query = Order.query
        
        # Filtrar por estado si se proporciona
        if estado:
            query = query.filter_by(estado=estado)
        
        # Ordenar por fecha de creación (más recientes primero)
        query = query.order_by(Order.creado_en.desc())
        
        # Paginación
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        orders_list = []
        for order in pagination.items:
            user = User.query.get(order.user_id)
            orders_list.append({
                "id": order.id,
                "user_info": {
                    "id": user.id,
                    "nombre": f"{user.Nombre} {user.Apellido}",
                    "email": user.Email
                },
                "total": float(order.total),
                "estado": order.estado,
                "metodo_pago": order.metodo_pago,
                "creado_en": order.creado_en.isoformat() if order.creado_en else None,
                "detalles_count": len(order.detalles)
            })
        
        return jsonify({
            "status": "success",
            "data": {
                "orders": orders_list,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": pagination.total,
                    "pages": pagination.pages
                }
            }
        }), 200
        
    except SQLAlchemyError as e:
        return jsonify({
            "status": "error",
            "message": "Error en la base de datos",
            "details": str(e)
        }), 500
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Error interno del servidor",
            "details": str(e)
        }), 500



# =====================================
# ESTABLECER COMO PRINCIPAL
# =====================================
@app.route("/address/<string:address_id>/set_default", methods=["PUT"])  # <- CAMBIA int por string
def set_default_address(address_id):
    try:
        data = request.get_json()
        user_id = data.get("user_id")

        # quitar el estado principal de las demás direcciones
        Address.query.filter_by(user_id=user_id).update({"principal": False})

        # establecer la nueva dirección principal
        addr = Address.query.get(address_id)
        if not addr:
            return jsonify({"error": "Dirección no encontrada"}), 404
        addr.principal = True

        db.session.commit()
        return jsonify({"status": "success", "message": "Dirección principal actualizada"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

    # =====================================
# EDITAR DIRECCIÓN EXISTENTE (VERSIÓN MEJORADA)
# =====================================
@app.route("/address/<string:address_id>/edit", methods=["PUT"])
def edit_address(address_id):
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if not data:
            return jsonify({
                "status": "error", 
                "message": "No se enviaron datos"
            }), 400

        # Buscar la dirección
        addr = Address.query.get(address_id)
        if not addr:
            return jsonify({
                "status": "error",
                "message": "Dirección no encontrada"
            }), 404

        # Verificar que el usuario existe
        user = User.query.get(data.get("user_id"))
        if not user:
            return jsonify({
                "status": "error",
                "message": "Usuario no encontrado"
            }), 404

        # Si se está estableciendo como principal, quitar principal de las demás
        if data.get("principal"):
            print(f"🔄 Estableciendo dirección {address_id} como principal para usuario {user.id}")
            Address.query.filter_by(user_id=user.id).update({"principal": False})

        # Actualizar campos solo si se enviaron en la petición
        update_fields = []
        if "direccion" in data:
            addr.direccion = data["direccion"]
            update_fields.append("direccion")
        
        if "ciudad" in data:
            addr.ciudad = data["ciudad"]
            update_fields.append("ciudad")
        
        if "estado_provincia" in data:
            addr.estado_provincia = data["estado_provincia"]
            update_fields.append("estado_provincia")
        
        if "codigo_postal" in data:
            addr.codigo_postal = data["codigo_postal"]
            update_fields.append("codigo_postal")
        
        if "pais" in data:
            addr.pais = data["pais"]
            update_fields.append("pais")
        
        if "tipo_direccion" in data:
            addr.tipo_direccion = data["tipo_direccion"]
            update_fields.append("tipo_direccion")
        
        if "principal" in data:
            addr.principal = bool(data["principal"])
            update_fields.append("principal")

        # Validar que al menos un campo fue actualizado
        if not update_fields:
            return jsonify({
                "status": "error",
                "message": "No se proporcionaron campos para actualizar"
            }), 400

        db.session.commit()

        print(f"✅ Dirección {address_id} actualizada. Campos modificados: {update_fields}")

        return jsonify({
            "status": "success",
            "message": "Dirección actualizada correctamente",
            "data": {
                "id": addr.id,
                "direccion": addr.direccion,
                "ciudad": addr.ciudad,
                "estado_provincia": addr.estado_provincia,
                "codigo_postal": addr.codigo_postal,
                "pais": addr.pais,
                "tipo_direccion": addr.tipo_direccion,
                "principal": addr.principal,
                "campos_actualizados": update_fields
            }
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"❌ Error de base de datos: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Error en la base de datos",
            "details": str(e)
        }), 500

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error interno: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Error interno del servidor",
            "details": str(e)
        }), 500
    



    # =====================================
# OBTENER TODAS LAS ÓRDENES CON DETALLES COMPLETOS (PARA ADMIN)
# =====================================
@app.route("/admin/orders", methods=["GET"])
def get_all_orders_admin():
    try:
        # Parámetros de paginación y filtros
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        estado = request.args.get('estado', None)
        fecha_inicio = request.args.get('fecha_inicio', None)
        fecha_fin = request.args.get('fecha_fin', None)
        
        # Consulta base con joins para obtener información completa
        query = db.session.query(
            Order, 
            User, 
            db.func.count(OrderDetail.id).label('total_productos'),
            db.func.sum(OrderDetail.cantidad).label('total_items')
        ).join(
            User, Order.user_id == User.id
        ).outerjoin(
            OrderDetail, Order.id == OrderDetail.order_id
        ).group_by(
            Order.id, User.id
        )
        
        # Aplicar filtros
        if estado:
            query = query.filter(Order.estado == estado)
        
        if fecha_inicio:
            try:
                fecha_inicio_dt = datetime.strptime(fecha_inicio, '%Y-%m-%d')
                query = query.filter(Order.creado_en >= fecha_inicio_dt)
            except ValueError:
                return jsonify({
                    "status": "error",
                    "message": "Formato de fecha_inicio inválido. Use YYYY-MM-DD"
                }), 400
        
        if fecha_fin:
            try:
                fecha_fin_dt = datetime.strptime(fecha_fin, '%Y-%m-%d')
                # Incluir todo el día de la fecha_fin
                fecha_fin_dt = fecha_fin_dt.replace(hour=23, minute=59, second=59)
                query = query.filter(Order.creado_en <= fecha_fin_dt)
            except ValueError:
                return jsonify({
                    "status": "error",
                    "message": "Formato de fecha_fin inválido. Use YYYY-MM-DD"
                }), 400
        
        # Ordenar por fecha de creación (más recientes primero)
        query = query.order_by(Order.creado_en.desc())
        
        # Paginación
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        orders_list = []
        for order, user, total_productos, total_items in pagination.items:
            
            # Obtener detalles completos de los productos
            detalles_completos = []
            for detalle in order.detalles:
                producto = Product.query.get(detalle.product_id)
                detalles_completos.append({
                    "producto_id": producto.id if producto else None,
                    "producto_nombre": producto.nombre if producto else "Producto no disponible",
                    "producto_imagen": producto.imagen_url if producto else None,
                    "cantidad": detalle.cantidad,
                    "precio_unitario": float(detalle.precio_unitario),
                    "subtotal": float(detalle.subtotal)
                })
            
            # Información de la dirección de envío si existe
            direccion_envio = None
            if hasattr(order, 'address_id') and order.address_id:
                address = Address.query.get(order.address_id)
                if address:
                    direccion_envio = {
                        "direccion": address.direccion,
                        "ciudad": address.ciudad,
                        "estado_provincia": address.estado_provincia,
                        "codigo_postal": address.codigo_postal,
                        "pais": address.pais
                    }
            
            order_data = {
                "id": order.id,
                "order_short_id": f"#ORD-{order.id[:8].upper()}",
                "user_info": {
                    "id": user.id,
                    "nombre_completo": f"{user.Nombre} {user.Apellido}",
                    "email": user.Email,
                    "telefono": user.Telefono,
                    "fecha_registro": user.Fecha_creacion.isoformat() if user.Fecha_creacion else None
                },
                "total": float(order.total),
                "estado": order.estado,
                "metodo_pago": order.metodo_pago,
                "direccion_envio": direccion_envio,
                "creado_en": order.creado_en.isoformat() if order.creado_en else None,
                "resumen": {
                    "total_productos": total_productos,
                    "total_items": total_items or 0
                },
                "detalles": detalles_completos
            }
            
            orders_list.append(order_data)
        
        return jsonify({
            "status": "success",
            "data": {
                "orders": orders_list,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": pagination.total,
                    "pages": pagination.pages
                },
                "estadisticas": {
                    "total_ordenes": pagination.total,
                    "ordenes_pendientes": Order.query.filter_by(estado='Pendiente').count(),
                    "ordenes_completadas": Order.query.filter_by(estado='Entregado').count(),
                    "ingresos_totales": db.session.query(db.func.sum(Order.total)).scalar() or 0
                }
            }
        }), 200
        
    except SQLAlchemyError as e:
        return jsonify({
            "status": "error",
            "message": "Error en la base de datos",
            "details": str(e)
        }), 500
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Error interno del servidor",
            "details": str(e)
        }), 500

# =====================================
# OBTENER ESTADÍSTICAS DE ÓRDENES (PARA DASHBOARD)
# =====================================
@app.route("/admin/orders/stats", methods=["GET"])
def get_orders_stats():
    try:
        # Ventas totales
        ventas_totales = db.session.query(db.func.sum(Order.total)).scalar() or 0
        
        # Conteo por estado
        estados_count = db.session.query(
            Order.estado, 
            db.func.count(Order.id)
        ).group_by(Order.estado).all()
        
        # Ventas del último mes
        ultimo_mes = datetime.utcnow() - timedelta(days=30)
        ventas_ultimo_mes = db.session.query(db.func.sum(Order.total)).filter(
            Order.creado_en >= ultimo_mes
        ).scalar() or 0
        
        # Órdenes del último mes
        ordenes_ultimo_mes = Order.query.filter(
            Order.creado_en >= ultimo_mes
        ).count()
        
        # Productos más vendidos (top 5)
        productos_mas_vendidos = db.session.query(
            Product.nombre,
            db.func.sum(OrderDetail.cantidad).label('total_vendido')
        ).join(
            OrderDetail, Product.id == OrderDetail.product_id
        ).group_by(
            Product.id, Product.nombre
        ).order_by(
            db.desc('total_vendido')
        ).limit(5).all()
        
        return jsonify({
            "status": "success",
            "data": {
                "ventas_totales": float(ventas_totales),
                "ventas_ultimo_mes": float(ventas_ultimo_mes),
                "ordenes_ultimo_mes": ordenes_ultimo_mes,
                "conteo_estados": {estado: count for estado, count in estados_count},
                "productos_mas_vendidos": [
                    {"producto": nombre, "total_vendido": int(total)} 
                    for nombre, total in productos_mas_vendidos
                ]
            }
        }), 200
        
    except SQLAlchemyError as e:
        return jsonify({
            "status": "error",
            "message": "Error en la base de datos",
            "details": str(e)
        }), 500
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Error interno del servidor",
            "details": str(e)
        }), 500

# =====================================
# ACTUALIZAR ESTADO DE ORDEN (ADMIN)
# =====================================
@app.route("/admin/orders/<string:order_id>/status", methods=["PUT"])
def update_order_status_admin(order_id):
    try:
        data = request.get_json()
        
        if not data or 'estado' not in data:
            return jsonify({
                "status": "error",
                "message": "Se requiere el campo 'estado'"
            }), 400
        
        nuevo_estado = data['estado']
        
        # Estados válidos
        estados_validos = ['Pendiente', 'Confirmado', 'En preparación', 'Enviado', 'Entregado', 'Cancelado']
        
        if nuevo_estado not in estados_validos:
            return jsonify({
                "status": "error",
                "message": f"Estado no válido. Estados permitidos: {', '.join(estados_validos)}"
            }), 400
        
        # Obtener y actualizar la orden
        order = Order.query.get(order_id)
        if not order:
            return jsonify({
                "status": "error",
                "message": "Orden no encontrada"
            }), 404
        
        estado_anterior = order.estado
        order.estado = nuevo_estado
        
        # Si se cancela una orden, devolver productos al stock
        if nuevo_estado == 'Cancelado' and estado_anterior != 'Cancelado':
            for detalle in order.detalles:
                producto = Product.query.get(detalle.product_id)
                if producto:
                    producto.stock += detalle.cantidad
                    producto.actualizado_en = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": f"Estado de la orden actualizado de '{estado_anterior}' a '{nuevo_estado}'",
            "data": {
                "order_id": order.id,
                "estado_anterior": estado_anterior,
                "nuevo_estado": nuevo_estado,
                "actualizado_en": datetime.utcnow().isoformat()
            }
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Error en la base de datos",
            "details": str(e)
        }), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Error interno del servidor",
            "details": str(e)
        }), 500
    


from sqlalchemy import func

@app.route('/admin/products/count-stats', methods=['GET'])
def get_products_count_stats():
    try:
        # Contar productos activos con stock > 0
        total_products = Product.query.filter_by(activo=True).filter(Product.stock > 0).count()
        
        # Sumar stock total de productos activos
        total_stock_result = db.session.query(func.sum(Product.stock)).filter(
            Product.activo == True,
            Product.stock > 0
        ).scalar()
        total_stock = total_stock_result if total_stock_result else 0
        
        # Contar productos por categoría
        category_stats = db.session.query(
            Category.nombre,
            func.count(Product.id),
            func.sum(Product.stock)
        ).join(Product, Category.id == Product.categoria_id).filter(
            Product.activo == True,
            Product.stock > 0
        ).group_by(Category.nombre).all()
        
        # Contar productos por género
        gender_stats = db.session.query(
            Product.genero,
            func.count(Product.id),
            func.sum(Product.stock)
        ).filter(
            Product.activo == True,
            Product.stock > 0
        ).group_by(Product.genero).all()
        
        # Procesar datos de categorías
        categorias_data = {}
        for cat_nombre, count, stock in category_stats:
            categorias_data[cat_nombre] = {
                'total': count,
                'stock_total': stock if stock else 0
            }
        
        # Procesar datos de géneros
        generos_data = {}
        for genero, count, stock in gender_stats:
            genero_nombre = genero if genero else 'Unisex'
            generos_data[genero_nombre] = {
                'count': count,
                'stock': stock if stock else 0
            }
        
        return jsonify({
            'status': 'success',
            'data': {
                'total_productos': total_products,
                'total_stock': total_stock,
                'categorias': categorias_data,
                'generos': generos_data
            }
        })
        
    except Exception as e:
        print(f"Error getting product stats: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Error al obtener estadísticas de productos',
            'error': str(e)
        }), 500
    
    # ===========================
# ENDPOINTS PARA PRODUCTOS
# ===========================


      # ===========================
# ENDPOINTS CORREGIDOS PARA PRODUCTOS
# ===========================


from sqlalchemy import or_
# ===========================
# ENDPOINTS PARA PRODUCTOS
# ===========================



# Obtener todos los productos con filtros
@app.route('/admin/products', methods=['GET'])
def get_allt_products():
    try:
        print("=== INICIANDO CONSULTA DE PRODUCTOS ===")
        
        # Parámetros de filtro
        search = request.args.get('search', '')
        categoria = request.args.get('categoria', '')
        estado = request.args.get('estado', '')
        
        print(f"Filtros recibidos - search: '{search}', categoria: '{categoria}', estado: '{estado}'")
        
        # Consulta base con join explícito
        query = db.session.query(Product, Category).join(Category, Product.categoria_id == Category.id)
        
        # Aplicar filtros
        if search:
            query = query.filter(
                or_(
                    Product.nombre.ilike(f'%{search}%'),
                    Product.descripcion.ilike(f'%{search}%'),
                    Category.nombre.ilike(f'%{search}%')
                )
            )
            print(f"Aplicando filtro de búsqueda: {search}")
        
        if categoria:
            query = query.filter(Category.nombre == categoria)
            print(f"Aplicando filtro de categoría: {categoria}")
        
        if estado == 'active':
            query = query.filter(Product.activo == True, Product.stock > 0)
            print("Filtrando productos activos con stock")
        elif estado == 'inactive':
            query = query.filter(Product.activo == False)
            print("Filtrando productos inactivos")
        elif estado == 'outofstock':
            query = query.filter(Product.stock == 0)
            print("Filtrando productos sin stock")
        
        # Ejecutar consulta
        results = query.all()
        print(f"Productos encontrados: {len(results)}")
        
        # Formatear respuesta
        products_data = []
        for product, category in results:
            product_data = {
                'id': product.id,
                'nombre': product.nombre,
                'descripcion': product.descripcion or '',
                'precio': float(product.precio),
                'stock': product.stock,
                'imagen_url': product.imagen_url or '',
                'genero': product.genero,
                'categoria': category.nombre,
                'categoria_id': product.categoria_id,
                'activo': product.activo,
                'creado_en': product.creado_en.isoformat() if product.creado_en else None
            }
            products_data.append(product_data)
            print(f"Producto: {product.nombre}, Categoría: {category.nombre}")
        
        return jsonify({
            'status': 'success',
            'data': {
                'products': products_data,
                'total': len(products_data)
            }
        })
        
    except Exception as e:
        print(f"❌ ERROR en get_all_products: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        
        return jsonify({
            'status': 'error',
            'message': f'Error al obtener los productos: {str(e)}'
        }), 500

# Obtener un producto específico
@app.route('/admin/products/<product_id>', methods=['GET'])
def get_product(product_id):
    try:
        product = Product.query.filter_by(id=product_id).first()
        
        if not product:
            return jsonify({
                'status': 'error',
                'message': 'Producto no encontrado'
            }), 404
        
        product_data = {
            'id': product.id,
            'nombre': product.nombre,
            'descripcion': product.descripcion,
            'precio': product.precio,
            'stock': product.stock,
            'imagen_url': product.imagen_url,
            'genero': product.genero,
            'categoria': product.categoria.nombre,
            'categoria_id': product.categoria_id,
            'activo': product.activo,
            'creado_en': product.creado_en.isoformat() if product.creado_en else None,
            'actualizado_en': product.actualizado_en.isoformat() if product.actualizado_en else None
        }
        
        return jsonify({
            'status': 'success',
            'data': product_data
        })
        
    except Exception as e:
        print(f"Error getting product: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Error al obtener el producto'
        }), 500

# Crear nuevo producto
@app.route('/admin/products', methods=['POST'])
def create_product():
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        required_fields = ['nombre', 'precio', 'categoria_id', 'genero']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'status': 'error',
                    'message': f'El campo {field} es requerido'
                }), 400
        
        # Verificar que la categoría existe
        categoria = Category.query.filter_by(id=data['categoria_id']).first()
        if not categoria:
            return jsonify({
                'status': 'error',
                'message': 'La categoría no existe'
            }), 400
        
        # Crear producto
        new_product = Product(
            nombre=data['nombre'],
            descripcion=data.get('descripcion', ''),
            precio=float(data['precio']),
            stock=int(data.get('stock', 0)),
            imagen_url=data.get('imagen_url', ''),
            genero=data['genero'],
            categoria_id=data['categoria_id'],
            activo=data.get('activo', True)
        )
        
        db.session.add(new_product)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Producto creado exitosamente',
            'data': {
                'id': new_product.id,
                'nombre': new_product.nombre
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating product: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Error al crear el producto'
        }), 500

# Actualizar producto
@app.route('/admin/products/<product_id>', methods=['PUT'])
def update_product(product_id):
    try:
        product = Product.query.filter_by(id=product_id).first()
        
        if not product:
            return jsonify({
                'status': 'error',
                'message': 'Producto no encontrado'
            }), 404
        
        data = request.get_json()
        
        # Actualizar campos
        if 'nombre' in data:
            product.nombre = data['nombre']
        if 'descripcion' in data:
            product.descripcion = data['descripcion']
        if 'precio' in data:
            product.precio = float(data['precio'])
        if 'stock' in data:
            product.stock = int(data['stock'])
        if 'imagen_url' in data:
            product.imagen_url = data['imagen_url']
        if 'genero' in data:
            product.genero = data['genero']
        if 'categoria_id' in data:
            # Verificar que la categoría existe
            categoria = Category.query.filter_by(id=data['categoria_id']).first()
            if not categoria:
                return jsonify({
                    'status': 'error',
                    'message': 'La categoría no existe'
                }), 400
            product.categoria_id = data['categoria_id']
        if 'activo' in data:
            product.activo = bool(data['activo'])
        
        product.actualizado_en = db.func.now()
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Producto actualizado exitosamente'
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating product: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Error al actualizar el producto'
        }), 500
# Eliminar producto (soft delete) - URL CORREGIDA
@app.route('/admin/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    try:
        product = Product.query.filter_by(id=product_id).first()
        
        if not product:
            return jsonify({
                'status': 'error',
                'message': 'Producto no encontrado'
            }), 404
        
        # Soft delete - marcar como inactivo
        product.activo = False
        product.actualizado_en = db.func.now()
        
        db.session.commit()
        
        print(f"✅ Producto eliminado (soft delete): {product.nombre} (ID: {product_id})")
        
        return jsonify({
            'status': 'success',
            'message': 'Producto eliminado exitosamente'
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error deleting product: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Error al eliminar el producto'
        }), 500
    
@app.route('/admin/categories', methods=['GET'])
def get_categories():
    try:
        print("=== OBTENIENDO CATEGORÍAS ===")
        categories = Category.query.all()
        print(f"Categorías encontradas: {len(categories)}")
        
        categories_data = []
        for cat in categories:
            categories_data.append({
                'id': cat.id,
                'nombre': cat.nombre,
                'descripcion': cat.descripcion or ''
            })
            print(f"Categoría: {cat.nombre} (ID: {cat.id})")
        
        return jsonify({
            'status': 'success',
            'data': categories_data
        })
        
    except Exception as e:
        print(f"❌ ERROR en get_categories: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Error al obtener las categorías: {str(e)}'
        }), 500

# ===========================
# ENDPOINT PARA MÉTODOS DE PAGO MEJORADO
# ===========================
@app.route('/admin/orders/payment-methods-detailed', methods=['GET'])
def get_detailed_payment_methods():
    try:
        print("=== OBTENIENDO ESTADÍSTICAS DETALLADAS DE MÉTODOS DE PAGO ===")
        
        # Consulta para órdenes completadas con método de pago
        payment_stats = db.session.query(
            Order.metodo_pago,
            func.count(Order.id),
            func.sum(Order.total)
        ).filter(
            Order.metodo_pago.isnot(None),
            Order.metodo_pago != '',
            Order.estado.in_(['Completado', 'Entregado', 'Confirmado'])
        ).group_by(Order.metodo_pago).all()
        
        print(f"Métodos de pago encontrados: {len(payment_stats)}")
        
        # Mapeo COMPLETO y normalización de métodos de pago
        method_mapping = {
            # Tarjetas de crédito
            'visa': 'Visa',
            'mastercard': 'Mastercard', 
            'masterrcad': 'Mastercard',  # Corrige typo
            'amex': 'American Express',
            'american express': 'American Express',
            'american_express': 'American Express',
            'credit_card': 'Tarjeta Crédito',
            'credit card': 'Tarjeta Crédito',
            'credito': 'Tarjeta Crédito',
            'crédito': 'Tarjeta Crédito',
            
            # Tarjetas de débito
            'debit_card': 'Tarjeta Débito',
            'debit card': 'Tarjeta Débito',
            'debito': 'Tarjeta Débito',
            'débito': 'Tarjeta Débito',
            
            # Otros métodos
            'paypal': 'PayPal',
            'transfer': 'Transferencia',
            'transferencia': 'Transferencia',
            'cash': 'Efectivo',
            'efectivo': 'Efectivo',
            'card': 'Tarjeta',
            'oxxo': 'OXXO',
            'spei': 'SPEI',
            'mercado pago': 'Mercado Pago',
            'mercado_pago': 'Mercado Pago'
        }
        
        # Diccionario para agrupar métodos normalizados
        grouped_data = {}
        
        for method, count, amount in payment_stats:
            if not method:
                continue
                
            # Normalizar el método (minúsculas, sin espacios extras)
            method_clean = method.strip().lower()
            
            # Buscar en el mapeo o usar el nombre original
            normalized_method = method_mapping.get(method_clean, method.title())
            
            print(f"Método original: '{method}' -> Normalizado: '{normalized_method}'")
            
            # Agrupar por método normalizado
            if normalized_method in grouped_data:
                grouped_data[normalized_method]['cantidad'] += count
                grouped_data[normalized_method]['monto_total'] += float(amount) if amount else 0
                grouped_data[normalized_method]['metodos_originales'].add(method)
            else:
                grouped_data[normalized_method] = {
                    'cantidad': count,
                    'monto_total': float(amount) if amount else 0,
                    'metodos_originales': {method}
                }
        
        # Convertir a lista final
        payment_data = []
        total_orders = 0
        total_amount = 0
        
        for method_name, data in grouped_data.items():
            payment_data.append({
                'metodo': method_name,
                'cantidad': data['cantidad'],
                'monto_total': data['monto_total'],
                'metodos_originales': list(data['metodos_originales']),
                'variantes': len(data['metodos_originales'])
            })
            
            total_orders += data['cantidad']
            total_amount += data['monto_total']
            
            print(f"✅ {method_name}: {data['cantidad']} órdenes, ${data['monto_total']:.2f} (variantes: {data['metodos_originales']})")
        
        # Ordenar por cantidad (más popular primero)
        payment_data.sort(key=lambda x: x['cantidad'], reverse=True)
        
        # Calcular porcentajes
        for data in payment_data:
            data['porcentaje'] = round((data['cantidad'] / total_orders) * 100, 1) if total_orders > 0 else 0
        
        return jsonify({
            'status': 'success',
            'data': {
                'metodos_pago': payment_data,
                'totales': {
                    'ordenes': total_orders,
                    'monto': total_amount,
                    'metodos_diferentes': len(payment_data),
                    'variantes_encontradas': sum(item['variantes'] for item in payment_data)
                },
                'resumen': f"Analizadas {total_orders} órdenes con {len(payment_data)} métodos de pago diferentes"
            }
        })
        
    except Exception as e:
        print(f"❌ ERROR en get_detailed_payment_methods: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Error al obtener métodos de pago: {str(e)}'
        }), 500


        # ===========================
# ENDPOINTS PARA CATEGORÍAS
# ===========================



# ===========================
# ENDPOINTS PARA CATEGORÍAS (CORREGIDOS)
# ===========================


# Crear nueva categoría (CORREGIDO)
@app.route('/admin/categories', methods=['POST'])
def create_category():
    try:
        data = request.get_json()
        print(f"🔍 Datos recibidos para crear categoría: {data}")
        
        # Validar datos requeridos
        if not data.get('nombre'):
            return jsonify({
                'status': 'error',
                'message': 'El nombre de la categoría es requerido'
            }), 400
        
        nombre = data['nombre'].strip()
        
        # Verificar si ya existe una categoría con el mismo nombre
        # QUITAMOS la referencia al campo 'activo' que no existe
        existing_category = Category.query.filter(
            db.func.lower(Category.nombre) == nombre.lower()
        ).first()
        
        if existing_category:
            return jsonify({
                'status': 'error',
                'message': 'Ya existe una categoría con ese nombre'
            }), 400
        
        # Crear categoría - solo con los campos que tienes en tu modelo
        new_category = Category(
            nombre=nombre,
            descripcion=data.get('descripcion', '')
            # No incluimos 'activo' porque no existe en tu modelo
        )
        
        db.session.add(new_category)
        db.session.commit()
        
        print(f"✅ Categoría creada: {new_category.nombre} (ID: {new_category.id})")
        
        return jsonify({
            'status': 'success',
            'message': 'Categoría creada exitosamente',
            'data': {
                'id': new_category.id,
                'nombre': new_category.nombre
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating category: {str(e)}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        return jsonify({
            'status': 'error',
            'message': 'Error al crear la categoría',
            'error': str(e)
        }), 500

# Actualizar categoría (CORREGIDO)
@app.route('/admin/categories/<category_id>', methods=['PUT'])
def update_category(category_id):
    try:
        category = Category.query.get(category_id)
        
        if not category:
            return jsonify({
                'status': 'error',
                'message': 'Categoría no encontrada'
            }), 404
        
        data = request.get_json()
        
        # Actualizar campos
        if 'nombre' in data:
            nuevo_nombre = data['nombre'].strip()
            
            # Verificar si el nuevo nombre ya existe en otra categoría
            existing_category = Category.query.filter(
                db.func.lower(Category.nombre) == nuevo_nombre.lower(),
                Category.id != category_id
            ).first()
            
            if existing_category:
                return jsonify({
                    'status': 'error',
                    'message': 'Ya existe otra categoría con ese nombre'
                }), 400
            
            category.nombre = nuevo_nombre
        
        if 'descripcion' in data:
            category.descripcion = data['descripcion']
        
        # Actualizar timestamp si tienes el campo
        if hasattr(category, 'actualizado_en'):
            category.actualizado_en = db.func.now()
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Categoría actualizada exitosamente'
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating category: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Error al actualizar la categoría'
        }), 500

# Eliminar categoría (CORREGIDO - sin soft delete)
@app.route('/admin/categories/<category_id>', methods=['DELETE'])
def delete_category(category_id):
    try:
        category = Category.query.get(category_id)
        
        if not category:
            return jsonify({
                'status': 'error',
                'message': 'Categoría no encontrada'
            }), 404
        
        # Verificar si hay productos usando esta categoría
        products_count = Product.query.filter_by(categoria_id=category_id).count()
        
        if products_count > 0:
            return jsonify({
                'status': 'error',
                'message': f'No se puede eliminar la categoría porque tiene {products_count} producto(s) asociado(s)'
            }), 400
        
        # Eliminación directa (no soft delete)
        db.session.delete(category)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Categoría eliminada exitosamente'
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting category: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Error al eliminar la categoría'
        }), 500
 # =====================================
# SEGUIMIENTO DE PAQUETES/ÓRDENES
# =====================================

# =====================================
# SEGUIMIENTO DE PAQUETES/ÓRDENES
# =====================================
@app.route("/api/tracking", methods=["POST"])
def track_package():
    """
    Endpoint para consultar el estado de una orden usando su ID como número de seguimiento
    """
    try:
        # Manejar tanto POST como GET
        if request.method == "GET":
            tracking_number = request.args.get('tracking_number')
            if not tracking_number:
                return jsonify({
                    "status": "error",
                    "message": "Se requiere el parámetro tracking_number en la URL"
                }), 400
        else:  # POST
            data = request.get_json()
            if not data or 'tracking_number' not in data:
                return jsonify({
                    "status": "error",
                    "message": "Se requiere el número de seguimiento (tracking_number)"
                }), 400
            tracking_number = data['tracking_number'].strip()
        
        print(f"🔍 Tracking recibido: {tracking_number}")
        print(f"📏 Longitud: {len(tracking_number)}")
        
        order = None
        
        # ESTRATEGIA 4 NUEVA: Buscar por primeros 8 caracteres del ID
        # Primero verificar si el tracking_number podría ser un ID corto (8 caracteres)
        if not order and len(tracking_number) == 8:
            # Buscar todas las órdenes y comparar sus primeros 8 caracteres
            all_orders = Order.query.all()
            for ord in all_orders:
                if str(ord.id)[:8].lower() == tracking_number.lower():
                    order = ord
                    print(f"✅ Orden encontrada por ID corto (8 chars): {tracking_number}")
                    break
        
        # ESTRATEGIA 1: Buscar directamente (para IDs no encriptados)
        if not order:
            order = Order.query.filter_by(id=tracking_number).first()
            if order:
                print(f"✅ Orden encontrada directamente: {tracking_number}")
        
        # ESTRATEGIA 2: Si es número, buscar como entero
        if not order and tracking_number.isdigit():
            order = Order.query.filter_by(id=int(tracking_number)).first()
            if order:
                print(f"✅ Orden encontrada como número: {int(tracking_number)}")
        
        # ESTRATEGIA 3: Intentar desencriptar
        if not order:
            print("🔐 Intentando desencriptar ID...")
            decrypted_id = decrypt_id(tracking_number)
            if decrypted_id:
                print(f"🔓 ID desencriptado: {decrypted_id}")
                order = Order.query.filter_by(id=decrypted_id).first()
                if order:
                    print(f"✅ Orden encontrada después de desencriptar: {decrypted_id}")
            else:
                print("❌ No se pudo desencriptar el ID")
        
        if not order:
            print("❌ No se encontró la orden con ninguna estrategia")
            
            # Mostrar algunos IDs de ejemplo para debugging
            sample_orders = Order.query.limit(3).all()
            print("📋 Ejemplos de IDs en la BD:")
            for o in sample_orders:
                id_str = str(o.id)
                print(f"  - ID completo: '{id_str}'")
                print(f"    Primeros 8 chars: '{id_str[:8]}' (para tracking)")
                
                # Intentar encriptar este ID para ver qué queda
                try:
                    key = base64.urlsafe_b64encode(app.config['SECRET_KEY'].ljust(32)[:32].encode())
                    cipher = Fernet(key)
                    encrypted = cipher.encrypt(id_str.encode()).decode()
                    print(f"    🔐 ID encriptado: {encrypted[:20]}...")
                except:
                    pass
            
            return jsonify({
                "status": "error",
                "message": "No se encontró ninguna orden con ese número de seguimiento",
                "tip": f"Prueba usando los primeros 8 caracteres del ID: 'xxxxxxx'"
            }), 404
        
        # Obtener información del usuario
        user = User.query.get(order.user_id)
        
        # Obtener detalles de la orden
        order_details = []
        for detalle in order.detalles:
            product = Product.query.get(detalle.product_id)
            if product:
                order_details.append({
                    "producto": product.nombre,
                    "cantidad": detalle.cantidad,
                    "precio_unitario": float(detalle.precio_unitario),
                    "subtotal": float(detalle.subtotal),
                    "imagen": product.imagen_url
                })
            else:
                order_details.append({
                    "producto": "Producto no disponible",
                    "cantidad": detalle.cantidad,
                    "precio_unitario": float(detalle.precio_unitario),
                    "subtotal": float(detalle.subtotal),
                    "imagen": None
                })
        
        # Obtener el ID corto (primeros 8 caracteres)
        order_id_full = str(order.id)
        order_id_short = order_id_full[:8]
        
        # Formatear la respuesta
        response = {
            "status": "success",
            "data": {
                "order_id": order_id_short,  # ← Solo primeros 8 caracteres
                "order_id_full": order_id_full,  # ← ID completo para referencia
                "numero_seguimiento": order_id_short,  # ← Igual que order_id
                "estado": order.estado,
                "estado_detallado": get_order_status_details(order.estado),
                "total": float(order.total),
                "metodo_pago": order.metodo_pago,
                "fecha_creacion": order.creado_en.isoformat() if order.creado_en else None,
                "cliente": {
                    "nombre": f"{user.Nombre} {user.Apellido}" if user else "Cliente no encontrado",
                    "email": user.Email if user else None
                },
                "detalles": order_details,
                "progreso": get_order_progress(order.estado),
                "mensaje_estado": get_status_message(order.estado),
                "nota_importante": f"Tu número de seguimiento es: #{order_id_short}"
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"❌ Error en seguimiento: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "message": "Error al consultar el estado del paquete"
        }), 500
    # =====================================
# ENDPOINT PARA DEBUGGING DE ENCRIPTACIÓN
# =====================================

@app.route("/api/debug/encrypt-test", methods=["GET"])
def debug_encrypt_test():
    """
    Endpoint para probar la encriptación/desencriptación
    """
    try:
        # Obtener una orden de ejemplo
        order = Order.query.first()
        if not order:
            return jsonify({"status": "error", "message": "No hay órdenes en la BD"}), 404
        
        original_id = str(order.id)
        
        # Encriptar el ID
        key = base64.urlsafe_b64encode(app.config['SECRET_KEY'].ljust(32)[:32].encode())
        cipher = Fernet(key)
        encrypted_id = cipher.encrypt(original_id.encode()).decode()
        
        # Desencriptar el ID
        decrypted_id = decrypt_id(encrypted_id)
        
        return jsonify({
            "status": "success",
            "data": {
                "original_id": original_id,
                "encrypted_id": encrypted_id,
                "decrypted_id": decrypted_id,
                "match": original_id == decrypted_id,
                "encryption_key": app.config['SECRET_KEY'],
                "key_length": len(app.config['SECRET_KEY']),
                "note": "Si 'match' es false, hay un problema con la encriptación"
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route("/api/debug/orders", methods=["GET"])
def debug_orders():
    """
    Endpoint para debugging - muestra todas las órdenes
    """
    try:
        orders = Order.query.order_by(Order.creado_en.desc()).limit(5).all()
        
        orders_list = []
        for order in orders:
            user = User.query.get(order.user_id)
            
            # Encriptar el ID para ver cómo queda
            key = base64.urlsafe_b64encode(app.config['SECRET_KEY'].ljust(32)[:32].encode())
            cipher = Fernet(key)
            encrypted_id = cipher.encrypt(str(order.id).encode()).decode()
            
            orders_list.append({
                "id": order.id,
                "id_str": str(order.id),
                "id_type": type(order.id).__name__,
                "encrypted_id": encrypted_id,
                "encrypted_short": encrypted_id[:20] + "...",
                "estado": order.estado,
                "total": float(order.total),
                "cliente": f"{user.Nombre} {user.Apellido}" if user else "Desconocido",
                "email": user.Email if user else "Desconocido",
                "fecha": order.creado_en.strftime("%d/%m/%Y %H:%M") if order.creado_en else None
            })
        
        return jsonify({
            "status": "success",
            "data": {
                "total_orders": Order.query.count(),
                "recent_orders": orders_list,
                "note": "Usa el 'encrypted_id' completo para probar el tracking"
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
# =====================================
# FUNCIONES AUXILIARES PARA DETECTAR/DESENCRIPTAR
# =====================================

def is_encrypted_id(tracking_id):
    """
    Detecta si un ID está encriptado (basado en patrones comunes)
    """
    # Patrones comunes de IDs encriptados:
    # 1. Base64: termina con '=' o tiene longitud específica
    # 2. Fernet: comienza con 'gAAA' y tiene ~44 caracteres
    if not tracking_id:
        return False
    
    # Si termina con = (común en base64)
    if tracking_id.endswith('='):
        return True
    
    # Si tiene longitud específica de Fernet (44 chars)
    if len(tracking_id) == 44 and tracking_id.startswith('gAAAA'):
        return True
    
    # Si contiene solo caracteres base64
    import re
    base64_pattern = re.compile(r'^[A-Za-z0-9+/]+={0,2}$')
    if base64_pattern.match(tracking_id) and len(tracking_id) > 20:
        return True
    
    return False

def decrypt_id_if_possible(encrypted_id):
    """
    Intenta desencriptar un ID si reconoce el formato
    """
    try:
        # Si parece base64 simple
        if encrypted_id.endswith('='):
            import base64
            try:
                decoded = base64.b64decode(encrypted_id.encode()).decode()
                print(f"🔓 Base64 decodificado: {decoded}")
                return decoded
            except:
                pass
        
        # Si parece Fernet
        if len(encrypted_id) == 44 and encrypted_id.startswith('gAAAA'):
            try:
                from cryptography.fernet import Fernet
                # Necesitas configurar tu clave de encriptación
                # key = Fernet.generate_key()  # Debes usar tu clave real
                # cipher = Fernet(key)
                # decrypted = cipher.decrypt(encrypted_id.encode()).decode()
                # return decrypted
                pass
            except:
                pass
                
        return None
    except Exception as e:
        print(f"❌ Error en desencriptación: {e}")
        return None
    
    # =====================================
# DESENCRIPTAR ID Y OBTENER ORDEN (PARA FRONTEND)
# =====================================

def decrypt_order_id(encrypted_id):
    """
    Desencripta el ID de la orden (si está encriptado)
    """
    try:
        # Si es un UUID normal, devolverlo tal cual
        if not encrypted_id or len(encrypted_id) < 32:
            return encrypted_id
        
        # Si parece un ID encriptado con Fernet (44 caracteres)
        if len(encrypted_id) == 44 and encrypted_id.startswith('gAAAA'):
            try:
                from cryptography.fernet import Fernet
                # Usa tu clave de encriptación - DEBES DEFINIR ESTA CLAVE
                ENCRYPTION_KEY = b'tu_clave_de_encriptacion_aqui_32_bytes=='
                cipher = Fernet(ENCRYPTION_KEY)
                decrypted = cipher.decrypt(encrypted_id.encode()).decode()
                return decrypted
            except Exception as e:
                print(f"❌ Error desencriptando Fernet: {e}")
                return encrypted_id
        
        # Si parece base64
        try:
            import base64
            decoded = base64.b64decode(encrypted_id.encode()).decode()
            return decoded
        except:
            return encrypted_id
            
    except Exception as e:
        print(f"❌ Error en decrypt_order_id: {e}")
        return encrypted_id

# =====================================
# OBTENER DETALLES DE ORDEN CON ID ENCRIPTADO
# =====================================
@app.route("/orders/encrypted/<string:encrypted_order_id>", methods=["GET"])
def get_encrypted_order_details(encrypted_order_id):
    """
    Endpoint especial para frontend que usa IDs encriptados
    """
    try:
        print(f"🔍 ID encriptado recibido: {encrypted_order_id}")
        
        # Intentar desencriptar el ID
        order_id = decrypt_order_id(encrypted_order_id)
        print(f"🔓 ID desencriptado: {order_id}")
        
        # Obtener la orden
        order = Order.query.get(order_id)
        
        if not order:
            # Intentar buscar con el ID encriptado directamente
            order = Order.query.get(encrypted_order_id)
            if not order:
                return jsonify({
                    "status": "error",
                    "message": "Orden no encontrada"
                }), 404
            else:
                order_id = order.id
        
        # Obtener información del usuario
        user = User.query.get(order.user_id)
        
        order_data = {
            "id": encrypted_order_id,  # Mantener el ID encriptado para el frontend
            "original_id": order.id,    # ID original para referencia
            "user_info": {
                "id": user.id,
                "nombre": f"{user.Nombre} {user.Apellido}",
                "email": user.Email,
                "telefono": user.Telefono
            },
            "total": float(order.total),
            "estado": order.estado,
            "metodo_pago": order.metodo_pago,
            "creado_en": order.creado_en.isoformat() if order.creado_en else None,
            "detalles": []
        }
        
        # Agregar detalles de la orden
        for detalle in order.detalles:
            producto = Product.query.get(detalle.product_id)
            order_data["detalles"].append({
                "id": detalle.id,
                "product_id": detalle.product_id,
                "producto_nombre": producto.nombre if producto else "Producto no disponible",
                "producto_descripcion": producto.descripcion if producto else None,
                "producto_imagen": producto.imagen_url if producto else None,
                "cantidad": detalle.cantidad,
                "precio_unitario": float(detalle.precio_unitario),
                "subtotal": float(detalle.subtotal)
            })
        
        return jsonify({
            "status": "success",
            "data": order_data
        }), 200
        
    except Exception as e:
        print(f"❌ Error en get_encrypted_order_details: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Error interno del servidor",
            "details": str(e)
        }), 500
    
@app.route("/api/tracking/email", methods=["POST"])
def track_by_email():
    """
    Buscar órdenes por email del usuario
    """
    try:
        data = request.get_json()
        
        if not data or 'email' not in data:
            return jsonify({
                "status": "error",
                "message": "Se requiere el email"
            }), 400
        
        email = data['email'].strip().lower()
        
        # Buscar usuario por email
        user = User.query.filter(db.func.lower(User.Email) == email).first()
        
        if not user:
            return jsonify({
                "status": "error",
                "message": "No se encontró ningún usuario con ese email"
            }), 404
        
        # Obtener todas las órdenes del usuario
        orders = Order.query.filter_by(user_id=user.id).order_by(Order.creado_en.desc()).all()
        
        if not orders:
            return jsonify({
                "status": "success",
                "message": "El usuario no tiene órdenes registradas",
                "data": {
                    "cliente": f"{user.Nombre} {user.Apellido}",
                    "email": user.Email,
                    "ordenes": []
                }
            }), 200
        
        orders_list = []
        for order in orders:
            order_summary = {
                "order_id": order.id,
                "numero_seguimiento": order.id,
                "estado": order.estado,
                "total": float(order.total),
                "fecha": order.creado_en.isoformat() if order.creado_en else None,
                "productos_count": len(order.detalles)
            }
            orders_list.append(order_summary)
        
        return jsonify({
            "status": "success",
            "data": {
                "cliente": f"{user.Nombre} {user.Apellido}",
                "email": user.Email,
                "total_ordenes": len(orders),
                "ordenes": orders_list
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Error en búsqueda por email: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Error al buscar órdenes por email"
        }), 500


# =====================================
# FUNCIONES AUXILIARES PARA SEGUIMIENTO
# =====================================

def get_order_status_details(status):
    """
    Devuelve detalles descriptivos para cada estado
    """
    status_details = {
        "Pendiente": {
            "descripcion": "Tu orden ha sido recibida y está siendo procesada",
            "icono": "⏳",
            "color": "warning"
        },
        "Confirmado": {
            "descripcion": "Tu pago ha sido confirmado y estamos preparando tu pedido",
            "icono": "✅",
            "color": "info"
        },
        "En preparación": {
            "descripcion": "Tu pedido está siendo empaquetado y preparado para envío",
            "icono": "📦",
            "color": "info"
        },
        "Enviado": {
            "descripcion": "¡Tu pedido está en camino! Ha sido entregado al transportista",
            "icono": "🚚",
            "color": "primary"
        },
        "Entregado": {
            "descripcion": "¡Pedido entregado! Esperamos que disfrutes tu compra",
            "icono": "🏠",
            "color": "success"
        },
        "Cancelado": {
            "descripcion": "Esta orden ha sido cancelada",
            "icono": "❌",
            "color": "danger"
        }
    }
    
    return status_details.get(status, {
        "descripcion": "Estado no definido",
        "icono": "❓",
        "color": "secondary"
    })


def get_order_progress(status):
    """
    Devuelve el progreso de la orden como porcentaje
    """
    progress_map = {
        "Pendiente": 25,
        "Confirmado": 40,
        "En preparación": 60,
        "Enviado": 80,
        "Entregado": 100,
        "Cancelado": 0
    }
    
    return progress_map.get(status, 0)


def get_status_message(status):
    """
    Devuelve un mensaje amigable según el estado
    """
    messages = {
        "Pendiente": "Estamos procesando tu pedido. Te notificaremos cuando sea confirmado.",
        "Confirmado": "¡Excelente! Tu pago ha sido verificado. Pronto comenzaremos a preparar tu pedido.",
        "En preparación": "Tu pedido está siendo cuidadosamente empaquetado por nuestro equipo.",
        "Enviado": "¡Tu paquete está en camino! Puedes seguir el envío con el transportista.",
        "Entregado": "¡Pedido entregado exitosamente! Gracias por confiar en Fashion Luxt.",
        "Cancelado": "Esta orden ha sido cancelada. Para más información, contacta a servicio al cliente."
    }
    
    return messages.get(status, "Estado no reconocido.")


# =====================================
# ENDPOINT PARA ACTUALIZAR ESTADO (ADMIN) - NUEVO NOMBRE
# =====================================

@app.route("/api/orders/<order_id>/update-tracking-status", methods=["PUT"])  # NOMBRE ÚNICO
def update_tracking_order_status(order_id):  # NOMBRE ÚNICO
    """
    Endpoint para que los administradores actualicen el estado de una orden
    """
    try:
        data = request.get_json()
        
        if not data or 'estado' not in data:
            return jsonify({
                "status": "error",
                "message": "Se requiere el nuevo estado"
            }), 400
        
        nuevo_estado = data['estado']
        notas = data.get('notas', '')
        
        # Estados válidos
        estados_validos = ['Pendiente', 'Confirmado', 'En preparación', 'Enviado', 'Entregado', 'Cancelado']
        
        if nuevo_estado not in estados_validos:
            return jsonify({
                "status": "error",
                "message": f"Estado no válido. Estados permitidos: {', '.join(estados_validos)}"
            }), 400
        
        # Buscar la orden
        order = Order.query.get(order_id)
        if not order:
            return jsonify({
                "status": "error",
                "message": "Orden no encontrada"
            }), 404
        
        # Guardar el estado anterior
        estado_anterior = order.estado
        
        # Actualizar estado
        order.estado = nuevo_estado
        
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": f"Estado actualizado de '{estado_anterior}' a '{nuevo_estado}'",
            "data": {
                "order_id": order.id,
                "nuevo_estado": nuevo_estado,
                "estado_anterior": estado_anterior,
                "actualizado_en": datetime.utcnow().isoformat()
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error actualizando estado: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Error al actualizar el estado de la orden"
        }), 500

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

@app.route("/api/contact/email", methods=["POST"])
def contact_email():
    """
    Endpoint para recibir consultas por email y enviarlas a tu correo
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "status": "error",
                "message": "No se recibieron datos"
            }), 400
        
        # Validar campos
        required_fields = ['name', 'email', 'subject', 'message']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({
                    "status": "error",
                    "message": f"El campo '{field}' es requerido"
                }), 400
        
        # ============================================
        # CONFIGURACIÓN DEL EMAIL - ¡CAMBIA ESTO!
        # ============================================
        
        # 1. TU EMAIL DE RECEPCIÓN (donde quieres recibir las consultas)
        TU_EMAIL = "integradoratiendaropa@gmail.com"  # ¡CAMBIA ESTO!
        
        # 2. Configuración SMTP (para Gmail)
        SMTP_SERVER = "integradoratiendaropa@gmail.com"
        SMTP_PORT = 587
        SMTP_USERNAME = "integradoratiendaropa@gmail.com"  # ¡CAMBIA ESTO!
        SMTP_PASSWORD = "tucontraseña"       # ¡CAMBIA ESTO!
        
        # 3. Crear el mensaje de email
        mensaje = MIMEMultipart()
        mensaje['From'] = SMTP_USERNAME
        mensaje['To'] = TU_EMAIL
        mensaje['Subject'] = f"[Fashion Luxt] Nueva consulta: {data['subject']}"
        
        # 4. Contenido del email
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">
                    🛍️ Nueva Consulta - Fashion Luxt
                </h2>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h3 style="color: #555;">📋 Información del Cliente</h3>
                    <p><strong>👤 Nombre:</strong> {data['name']}</p>
                    <p><strong>📧 Email:</strong> {data['email']}</p>
                    <p><strong>📅 Fecha:</strong> {data.get('timestamp', 'No especificada')}</p>
                </div>
                
                <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h3 style="color: #555;">📝 Asunto</h3>
                    <p>{data['subject']}</p>
                </div>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h3 style="color: #555;">💬 Mensaje</h3>
                    <p style="white-space: pre-line;">{data['message']}</p>
                </div>
                
                <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
                    <p>📱 <strong>Responder a:</strong> <a href="mailto:{data['email']}">{data['email']}</a></p>
                    <p>🕐 <strong>Recibido:</strong> {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        mensaje.attach(MIMEText(html_content, 'html'))
        
        # 5. Enviar el email
        try:
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
                server.send_message(mensaje)
                
            print(f"✅ Email enviado a {TU_EMAIL}")
            print(f"   De: {data['name']} <{data['email']}>")
            print(f"   Asunto: {data['subject']}")
            
        except Exception as e:
            print(f"❌ Error al enviar email: {str(e)}")
            # Si falla el envío, al menos imprimir en consola
            print(f"📧 CONSULTA RECIBIDA (no enviada por email):")
            print(f"   Nombre: {data['name']}")
            print(f"   Email: {data['email']}")
            print(f"   Asunto: {data['subject']}")
            print(f"   Mensaje: {data['message']}")
        
        # ============================================
        # FIN DE CONFIGURACIÓN
        # ============================================
        
        return jsonify({
            "status": "success",
            "message": "Consulta recibida exitosamente",
            "data": {
                "name": data['name'],
                "email": data['email'],
                "subject": data['subject']
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Error en contacto por email: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Error al procesar la consulta"
        }), 500

# EJECUCIÓN
# =====================================
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
