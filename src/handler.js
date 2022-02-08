const { nanoid } = require("nanoid");
const { bookshelf } = require("./bookshelf");
const addBookHandler = (request, h) => {
  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  if (!request.payload.hasOwnProperty("name") || name.trim().length < 1) {
    const response = h.response({
      status: "fail",
      message: "Gagal menambahkan buku. Mohon isi nama buku",
    });
    response.code(400);
    return response;
  } else if (readPage > pageCount) {
    const response = h.response({
      status: "fail",
      message:
        "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
    });
    response.code(400);
    return response;
  } else {
    const newBook = {
      id,
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      finished: pageCount === readPage,
      insertedAt,
      updatedAt,
    };

    bookshelf.push(newBook);

    const isSuccess = bookshelf.filter((book) => book.id === id).length > 0;
    if (isSuccess) {
      const response = h.response({
        data: {
          bookId: newBook.id,
        },
        status: "success",
        message: "Buku berhasil ditambahkan",
      });
      response.code(201);
      return response;
    }
    const response = h.response({
      status: "failed",
      message: "Buku gagal ditambahkan",
    });
    response.code(500);
    return response;
  }
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;
  console.log(name, reading, finished);
  let queryBooks;
  if (name !== undefined) {
    queryBooks = bookshelf.filter((book) => {
      if (book.name.toLowerCase().includes(name.toLowerCase())) return book;
    });
  } else {
    queryBooks = bookshelf;
  }

  if (reading == 0) {
    queryBooks = queryBooks.filter((book) => {
      if (book.reading === false) {
        console.log(book.reading);
        return book;
      }
    });
  } else if (reading == 1) {
    queryBooks = queryBooks.filter((book) => {
      if (book.reading === true) {
        console.log(book.reading);
        return book;
      }
    });
  }

  if (finished == 0) {
    queryBooks = queryBooks.filter((book) => {
      if (book.finished === false) {
        return book;
      }
    });
  } else if (finished == 1) {
    queryBooks = queryBooks.filter((book) => {
      if (book.finished === true) {
        return book;
      }
    });
  }
  const books = queryBooks.map((book) => {
    const { id, name, publisher } = book;
    return { id, name, publisher };
  });
  const response = h.response({
    status: "success",
    data: { books },
  });
  response.code(200);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const book = bookshelf.filter((n) => n.id === id)[0];

  if (book !== undefined) {
    return {
      status: "success",
      data: {
        book,
      },
    };
  }

  const response = h.response({
    status: "fail",
    message: "Buku tidak ditemukan",
  });
  response.code(404);
  return response;
};

const updateBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  if (!request.payload.hasOwnProperty("name") || name.trim().length < 1) {
    const response = h.response({
      status: "fail",
      message: "Gagal memperbarui buku. Mohon isi nama buku",
    });
    response.code(400);
    return response;
  } else if (readPage > pageCount) {
    const response = h.response({
      status: "fail",
      message:
        "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
    });
    response.code(400);
    return response;
  } else {
    const index = bookshelf.findIndex((book) => book.id === id);

    if (index !== -1) {
      bookshelf[index] = {
        ...bookshelf[index],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        finished: readPage === pageCount,
      };
      const response = h.response({
        status: "success",
        message: "Buku berhasil diperbarui",
      });
      response.code(200);
      return response;
    }
    const response = h.response({
      status: "fail",
      message: "Gagal memperbarui buku. Id tidak ditemukan",
    });
    response.code(404);
    return response;
  }
};

const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const index = bookshelf.findIndex((book) => book.id === id);

  if (index !== -1) {
    bookshelf.splice(index, 1);
    const response = h.response({
      status: "success",
      message: "Buku berhasil dihapus",
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: "fail",
    message: "Buku gagal dihapus. Id tidak ditemukan",
  });
  response.code(404);
  return response;
};
module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  updateBookByIdHandler,
  deleteBookByIdHandler,
};
