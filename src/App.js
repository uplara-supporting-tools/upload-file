import React, { useMemo, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useDropzone } from "react-dropzone";

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const activeStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

const thumbsContainer = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 16,
};

const thumb = {
  display: "inline-flex",
  borderRadius: 2,
  border: "1px solid #eaeaea",
  marginBottom: 8,
  marginRight: 8,
  width: 150,
  height: 150,
  padding: 4,
  boxSizing: "border-box",
};

const thumbInner = {
  display: "flex",
  minWidth: 0,
  overflow: "hidden",
};

const img = {
  display: "block",
  width: "auto",
  height: "100%",
};

let product_available = ["Sid"];

const url = "http://localhost:8000/standalone_add_product";

function App(props) {
  const { action, availableSlug } = props;
  const [files, setFiles] = useState([]);
  const [slug, setSlug] = useState("");

  useEffect(()=>{
    setSlug(availableSlug)
  },[availableSlug])
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    acceptedFiles,
    open,
  } = useDropzone({
    accept: "image/*",
    noClick: true,
    noKeyboard: true,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length == 0) {
        alert("Please upload a valid file.");
        return;
      }
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
    maxFiles: 1,
    multiple: false,
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject]
  );

  const thumbs = files.map((file) => (
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        <img src={file.preview} style={img} />
      </div>
    </div>
  ));

  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    },
    [files]
  );

  useEffect(() => {
    setFiles(acceptedFiles);
  }, [acceptedFiles]);

  const filepath = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  const slugCheck = () => {
    let flag = true
    for(let i = 0;i<product_available.length;i+=1){
      if(slug==product_available[i]){
        flag = false
        break
      }
    }
    return flag
  }

  const sendFile = () => {
    if (slug && acceptedFiles.length == 1) {
      if(action=='add' && !slugCheck()){
        alert('The product name already exist.')
        return
      }
      let data = new FormData();
      let h = new Headers();
      let productSlug = slug;
      let ext = acceptedFiles[0].path.split(".")[1];
      // data.append("host_id", "1");
      data.append("hostname", "shopify.com");
      data.append("product_slug", productSlug);
      data.append("cloth_image", acceptedFiles[0], productSlug + "." + ext);
      let req = new Request(url, {
        method: "POST",
        headers: h,
        body: data,
      });
      fetch(req)
        .then((res) => res.json())
        .then((res) => console.log(res))
        .catch((err) => console.error(err));
    } else {
      alert("Please complete the form to add product!");
    }
  };
  return (
    <div className="container">
      <input
        type="text"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
      {files.length != 1 && (
        <div {...getRootProps({ style })}>
          <input {...getInputProps()} onClick={open} />
          <p>Drag and drop file here</p>
          <p>OR</p>
          <button type="button" onClick={open}>
            Choose a file
          </button>
        </div>
      )}
      {files.length == 1 && (
        <div onClick={() => setFiles([])}>Choose Another file</div>
      )}
      {/* <aside>
        <h4>Files</h4>
        <ul>{filepath}</ul>
      </aside> */}
      <aside style={thumbsContainer}>{thumbs}</aside>
      {<button onClick={sendFile}>Send</button>}
    </div>
  );
}

export default App;
