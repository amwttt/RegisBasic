import { useState } from 'react'
import { View, Text, StyleSheet, TextInput, Pressable, Alert, Platform, ScrollView, KeyboardAvoidingView } from 'react-native'
import { useSQLiteContext } from 'expo-sqlite'
import { styles } from '../styles/registerStyles'
import Field from '../components/Field'
import { validateForm, hasErrors } from '../utils/validate'
import { registerStudent } from '../db/database'


const EMPTY_FORM = {
    name: '',
    surname: '',
    studentId: '',
    username: '',
    password: '',
    confirm: ''
}
const RegisterScreen = ({ onRegistered }) => {
    const db = useSQLiteContext()

    const [form, setForm] = useState(EMPTY_FORM)
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)
    const [ success, setSuccess] = useState('')

    function setField(field, value) {
        setForm((prev) => ({...prev, [field]: value}))

        if(errors[field]) {
            setErrors((prev) => {
                const next = {...prev}
                delete next[field]
                return next
            })
        }
    }

    async function handleSubmit() {
        setSuccess('')

        const found = validateForm(form)
        if (hasErrors(found)) {
            setErrors(found)
            return
        }

        console.log('ไม่มี errors ปรากฏ พร้อมบันทึก', form)

        setSaving(true)

        const result = await registerStudent(db, {
            name: form.name.trim(),
            surname: form.surname.trim(),
            sstudentId: form.studentId.trim(),
            username: form.username.trim(),
            password: form.password.trim()
        })

        setSaving(false)

        if (!result.ok) {
            if (result.field) setErrors({ [result.field]: result.message})
            else Alert.alert('ผิดพลาด', result.message)
            return
        }

        setForm(EMPTY_FORM)
        setErrors({})
        setSuccess(`ลงทะเบียนสำเร็จ หมายเลขในระบบคือ ${result.id}`)

    }
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps='handled'
            >
            <Text style={styles.intro}>กรุณากรอกข้อมูลให้ครบทุกช่อง</Text>

            {success !== '' && (
                <View style={styles.notice}>
                    <Text style={styles.noticeText}>{success}</Text>
                </View>
            )}

            <View style={styles.row}>
                <Field
                    style={styles.half}
                    label='ชื่อ'
                    placeholder="ชื่อ"
                    value={form.name}
                    onChangeText={(v) => setField('name', v)}
                    error={errors.name}
                />
                <Field
                    style={styles.half}
                    label='นามสกุล'
                    placeholder="นามสกุล"
                    value={form.surname}
                    onChangeText={(v) => setField('surname', v)}
                    error={errors.surname}
                />
            </View>
            <Field
                    label='รหัสนิสิต'
                    placeholder='67xxxxxxxx'
                    keyboardType='number-pad'
                    maxLength={10}
                    value={form.studentId}
                    onChangeText={(v) => setField('studentId', v)}
                    error={errors.studentId}
                />
                <Field
                    label='ชื่อผู้ใช้'
                    placeholder='ชื่อผู้ใช้'
                    hint='ห้ามซ้ำกับผู้ใช้คนอื่น'
                    autoCapitalize='none'
                    maxLength={20}
                    value={form.username}
                    onChangeText={(v) => setField('username', v)}
                    error={errors.username}
                />
                <Field
                    label='รหัสผ่าน'
                    hint='อย่างน้อย 8 ตัว มีทั้งตัวอักษรและตัวเลข'
                    placeholder='อย่างน้อย 8 ตัวอักษร'
                    secureTextEntry
                    autoCapitalize='none'
                    value={form.password}
                    onChangeText={(v) => setField('password', v)}
                    error={errors.password}
                />
                <Field
                    label='ยืนยันรหัสผ่าน'
                    placeholder='พิมพ์รหัสผ่านอีกครั้ง'
                    secureTextEntry
                    autoCapitalize='none'
                    value={form.confirm}
                    onChangeText={(v) => setField('confirm', v)}
                    error={errors.confirm}
                />
                <Pressable style={[styles.submit, saving && styles.submitDisabled]}
                onPress={handleSubmit} disabled={saving}>
                    <Text style={styles.submitText}>{saving ? 'กำลังบันทึก...' : 'ลงทะเบียน'}</Text>
                </Pressable>
            </ScrollView> 
        </KeyboardAvoidingView>
    )
}

export default RegisterScreen