import React, { useState } from 'react';
import { RiUpload2Line, RiDeleteBin6Line } from "react-icons/ri";
import axios from 'axios';
import { toast } from 'sonner'

const Home = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        dob: '',
        residentialAddress: {
            street1: '',
            street2: ''
        },
        sameAddress: false,
        permanentAddress: {
            street1: '',
            street2: ''
        },
        documents: [{ fileName: '', fileType: '', file: null }]
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes("residential") || name.includes("permanent")) {
            const addressType = name.includes("residential") ? "residentialAddress" : "permanentAddress";
            const field = name.replace("residential", "").replace("permanent", "").toLowerCase();

            setFormData({
                ...formData,
                [addressType]: {
                    ...formData[addressType],
                    [field]: value
                }
            });
        } else if (name === "sameAddress") {
            setFormData((prevData) => ({
                ...prevData,
                sameAddress: checked,
                permanentAddress: checked
                    ? { ...prevData.residentialAddress }
                    : { street1: '', street2: '' }
            }));
        } else {
            setFormData({
                ...formData,
                [name]: type === 'checkbox' ? checked : value
            });
        }
    };

    const validate = () => {
        let tempErrors = {};
        let isValid = true;

        if (!formData.firstName) {
            isValid = false;
            tempErrors.firstName = 'First Name is required';
        }
        if (!formData.lastName) {
            isValid = false;
            tempErrors.lastName = 'Last Name is required';
        }
        if (!formData.email) {
            isValid = false;
            tempErrors.email = 'Email is required';
        }
        if (!formData.dob) {
            isValid = false;
            tempErrors.dob = 'Date of Birth is required';
        } else {
            const age = new Date().getFullYear() - new Date(formData.dob).getFullYear();
            if (age < 18) {
                isValid = false;
                tempErrors.dob = 'You must be at least 18 years old';
            }
        }

        if (!formData.residentialAddress.street1) {
            isValid = false;
            tempErrors.street1 = 'Residential Street 1 is required';
        }

        if (!formData.sameAddress) {
            if (!formData.permanentAddress.street1) {
                isValid = false;
                tempErrors.permanentStreet1 = 'Permanent Street 1 is required';
            }
        }
        if (!formData.residentialAddress.street2) {
            isValid = false;
            tempErrors.street2 = 'Residential Street 1 is required';
        }

        if (!formData.sameAddress) {
            if (!formData.permanentAddress.street2) {
                isValid = false;
                tempErrors.permanentStreet2 = 'Permanent Street 1 is required';
            }
        }

        if (formData.documents.length < 2) {
            isValid = false;
            tempErrors.documents = 'At least two documents are required';
        } else {
            formData.documents.forEach((doc, index) => {
                if (!doc.fileName) {
                    isValid = false;
                    tempErrors[`documents_${index}_fileName`] = 'File Name is required';
                }
                if (!doc.fileType) {
                    isValid = false;
                    tempErrors[`documents_${index}_fileType`] = 'File Type is required';
                }
                if (!doc.file) {
                    isValid = false;
                    tempErrors[`documents_${index}_file`] = 'File is required';
                } else if (
                    (doc.fileType === '.pdf' && doc.file.type !== 'application/pdf') ||
                    (doc.fileType === '.doc' && !['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(doc.file.type)) ||
                    (doc.fileType === '.jpg' && !['image/jpeg', 'image/jpg'].includes(doc.file.type))
                ) {
                    isValid = false;
                    tempErrors[`documents_${index}_file`] = `File must be of type ${doc.fileType}`;
                }
            });
        }

        setErrors(tempErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validate()) {
            try {
                const formDataToSend = new FormData();
                formDataToSend.append('firstName', formData.firstName);
                formDataToSend.append('lastName', formData.lastName);
                formDataToSend.append('email', formData.email);
                formDataToSend.append('dob', formData.dob);
                formDataToSend.append('residentialAddress[street1]', formData.residentialAddress.street1);
                formDataToSend.append('residentialAddress[street2]', formData.residentialAddress.street2);

                if (formData.sameAddress) {
                    formDataToSend.append('permanentAddress[street1]', formData.residentialAddress.street1);
                    formDataToSend.append('permanentAddress[street2]', formData.residentialAddress.street2);
                } else {
                    formDataToSend.append('permanentAddress[street1]', formData.permanentAddress.street1);
                    formDataToSend.append('permanentAddress[street2]', formData.permanentAddress.street2);
                }

                formData.documents.forEach((doc) => {
                    formDataToSend.append('documents', doc.file);
                });

                const response = await axios.post('http://localhost:4000/api/form/submit', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                if (response?.data.success) {
                    toast.success("Form submittted successfully !")
                    setFormData({
                        firstName: '',
                        lastName: '',
                        email: '',
                        dob: '',
                        residentialAddress: {
                            street1: '',
                            street2: ''
                        },
                        sameAddress: false,
                        permanentAddress: {
                            street1: '',
                            street2: ''
                        },
                        documents: [{ fileName: '', fileType: '', file: null }]
                    })
                }

                console.log('Form submitted successfully:', response);
                console.log(response.success)

            } catch (error) {
                toast.error("Error submitting form !")
                console.log('Error submitting form:', error);
            }
        }
    };

    const addDocument = () => {
        setFormData({
            ...formData,
            documents: [...formData.documents, { fileName: '', fileType: '', file: null }]
        });
    };

    const removeDocument = (index) => {
        if (index === 0) return;
        const updatedDocuments = formData.documents.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            documents: updatedDocuments
        });
    };

    const handleDocumentChange = (index, e) => {
        const { name, value, files } = e.target;
        const updatedDocuments = [...formData.documents];
        updatedDocuments[index][name] = files ? files[0] : value;

        setFormData({
            ...formData,
            documents: updatedDocuments
        });
    };


    return (
        <>
            <div className="container">
                <form className="row g-4 my-3 mx-auto" style={{ maxWidth: "900px" }} onSubmit={handleSubmit}>
                    <div className="col-md-6">
                        <label className="form-label">First Name<span className='text-danger'>*</span></label>
                        <input
                            type="text"
                            className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                            name="firstName"
                            placeholder="Enter your first name here.."
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                        {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Last Name<span className='text-danger'>*</span></label>
                        <input
                            type="text"
                            className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                            name="lastName"
                            placeholder="Enter your last name here.."
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                        {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">E-mail<span className='text-danger'>*</span></label>
                        <input
                            type="email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            name="email"
                            placeholder="ex: myname@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Date of Birth<span className='text-danger'>*</span></label>
                        <input
                            type="date"
                            className={`form-control ${errors.dob ? 'is-invalid' : ''}`}
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            required
                        />
                        {errors.dob && <div className="invalid-feedback">{errors.dob}</div>}
                        <p className='textColor'>(Min, age should be 18 years)</p>
                    </div>
                    <label className='m-0 mt-4'>Residential Address</label>
                    <div className="col-md-6">
                        <label className="form-label textColor">Street 1<span className='text-danger'>*</span></label>
                        <input
                            type="text"
                            className={`form-control ${errors.street1 ? 'is-invalid' : ''}`}
                            name="residentialStreet1"
                            value={formData.residentialAddress?.street1 || ''}
                            onChange={handleChange}
                            required
                        />
                        {errors.street1 && <div className="invalid-feedback">{errors.street1}</div>}
                    </div>
                    <div className="col-md-6">
                        <label className="form-label textColor">Street 2<span className='text-danger'>*</span></label>
                        <input
                            type="text"
                            className="form-control"
                            name="residentialStreet2"
                            value={formData.residentialAddress?.street2 || ''}
                            onChange={handleChange}
                            // required
                        />
                        {errors.street2 && <div className="invalid-feedback">{errors.street2}</div>}
                    </div>
                    <div className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="sameAddress"
                            name="sameAddress"
                            checked={formData.sameAddress}
                            onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="sameAddress">
                            Same as Residential Address
                        </label>
                    </div>

                    {!formData.sameAddress && (
                        <>
                            <label className='m-0 mt-4'>Permanent Address</label>
                            <div className="col-md-6">
                                <label className="form-label textColor" >Street 1</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.permanentStreet1 ? 'is-invalid' : ''}`}
                                    name="permanentStreet1"
                                    value={formData.permanentAddress?.street1 || ''}
                                    onChange={handleChange}
                                    required={!formData.sameAddress}
                                    disabled={formData.sameAddress}
                                />
                                {errors.permanentStreet1 && <div className="invalid-feedback">{errors.permanentStreet1}</div>}
                            </div>
                            <div className="col-md-6">
                                <label className="form-label textColor">Street 2</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="permanentStreet2"
                                    value={formData.permanentAddress?.street2 || ''}
                                    onChange={handleChange}
                                    disabled={formData.sameAddress}
                                />
                                  {errors.permanentStreet2 && <div className="invalid-feedback">{errors.permanentStreet2}</div>}
                            </div>
                        </>
                    )}

                    <label className='m-0 mt-4'>Upload Documents</label>
                    {formData.documents.map((document, index) => (
                        <div className="row gy-3" key={index}>
                            <div className="col-md-3">
                                <label className="form-label textColor">File Name<span className='text-danger'>*</span></label>
                                <input
                                    type="text"
                                    className={`form-control`}
                                    name="fileName"
                                    value={document.fileName}
                                    onChange={(e) => handleDocumentChange(index, e)}
                                    required
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label textColor">Type of File<span className='text-danger'>*</span></label>
                                <select
                                    className={`form-select`}
                                    name="fileType"
                                    value={document.fileType}
                                    onChange={(e) => handleDocumentChange(index, e)}
                                    required
                                >
                                    <option value="">Select File Type</option>
                                    <option value=".pdf">PDF</option>
                                    <option value=".doc">DOC</option>
                                    <option value=".jpg">JPG</option>
                                    <option value=".webp">WEBP</option>
                                </select>
                                <p className='textColor'>(image, pdf.)</p>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label textColor">Upload File<span className='text-danger'>*</span></label>
                                <div className="input-group">
                                    <input
                                        type="file"
                                        className={`form-control`}
                                        name="file"
                                        onChange={(e) => handleDocumentChange(index, e)}
                                        required
                                        multiple
                                    />
                                </div>
                                {/* <div className="input-icon-wrapper">
                                    <input
                                        type="file"
                                        className="file-input"
                                        name="file"
                                        onChange={(e) => handleDocumentChange(index, e)}
                                        required
                                        multiple
                                    />
                                    <RiUpload2Line className="input-icon" />
                                </div> */}

                            </div>
                            <div className="col-md-3">
                                {index === 0 ? (
                                    <>
                                        <label></label>
                                        <p className='addd' onClick={() => addDocument()} style={{ cursor: "pointer" }}><span>+</span></p>

                                    </>
                                ) : (
                                    <>
                                        <label></label>
                                        <p className='addds' onClick={() => removeDocument(index)} style={{ cursor: "pointer" }}  ><span className='newDelete'><RiDeleteBin6Line /></span></p>

                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    {errors.documents && <div className="text-danger">{errors.documents}</div>}
                    <div className="row text-center">
                        <div className="py-5">
                            <button type="submit" className="butt_color">Submit</button>
                        </div>
                    </div>

                </form>
            </div>
        </>
    );
};

export default Home;
